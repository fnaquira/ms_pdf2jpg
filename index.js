const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { fromPath } = require("pdf2pic");
const { writeFileSync, unlink } = require("fs-extra");
const asyncForEach = require("asyncforeach_pe");
const cors = require("cors"); // Importa el middleware cors

const multer = require("multer");
const cron = require("node-cron");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./temp/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		if (!(file.mimetype == "application/pdf" || file.mimetype === "application/octet-stream")) {
			return cb(new Error("Solo se permiten archivos de PDF"));
		}
		cb(null, true);
	},
});

const app = express();

app.use(cors()); // Usa el middleware cors para todas las rutas

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.post("/convertir", upload.single("pdf"), async (req, res) => {
	// Guardar el archivo PDF en la carpeta temporal
	const pdfFile = req.file;
	const pdfFilename = pdfFile.filename;
	const tempFolder = "./temp";
	const pdfPath = path.join(tempFolder, pdfFilename);
	//return res.json({ message: "Hola mundo" });

	const outputFolder = "./output";
	const baseOptions = {
		density: 100,
		saveFolder: outputFolder,
		format: "jpg",
		width: 2480,
		height: 3508,
		timeout: 60000,
	};

	const convert = fromPath(pdfPath, baseOptions);

	// fix this shit later in pdf2pic
	convert.bulk(-1, true).then(async (outputs) => {
		// Escribir las imágenes en disco y devolver los nombres de archivo
		const images = [];
		await asyncForEach(outputs, (output) => {
			const filename = `base64-${pdfFilename}.${output.page}.jpg`;
			writeFileSync(outputFolder + "/" + filename, output.base64, "base64");
			images.push(filename);
		});
		// Eliminar el archivo PDF temporal
		await unlink(pdfPath);

		// Devolver los nombres de archivo de las imágenes generadas
		res.json({ images });
	});
});

app.post("/convertirlos", upload.array("pdfs"), async (req, res) => {
	// Guardar el archivo PDF en la carpeta temporal
	const pdfFiles = req.files;
	const pdfFilenames = pdfFiles.map((file) => file.filename);
	const tempFolder = "./temp";
	const pdfPaths = pdfFilenames.map((filename) => path.join(tempFolder, filename));

	const outputFolder = "./output";
	const baseOptions = {
		density: 100,
		saveFolder: outputFolder,
		format: "jpg",
		width: 2480,
		height: 3508,
		timeout: 60000,
	};

	const convertPromises = pdfPaths.map((pdfPath) => fromPath(pdfPath, baseOptions).bulk(-1, true));
	const outputsArray = await Promise.all(convertPromises);

	const imagesResponse = pdfFiles.map((file) => {return {name:file.originalname,imgs:[]};});

	// Escribir las imágenes en disco y devolver los nombres de archivo
	const imagesArray = await Promise.all(
		outputsArray.map(async (outputs, i) => {
			const images = [];
			await asyncForEach(outputs, (output) => {
				const filename = `base64-${pdfFilenames[i]}.${output.page}.jpg`;
				writeFileSync(outputFolder + "/" + filename, output.base64, "base64");
				//images.push(filename);
				imagesResponse[i].imgs.push(filename);
			});
			return images;
		})
	);

	// Eliminar los archivos PDF temporales
	await Promise.all(pdfPaths.map((pdfPath) => unlink(pdfPath)));

	// Devolver los nombres de archivo de las imágenes generadas
	res.json(imagesResponse);
});

app.get("/imagenes/:nombre", (req, res) => {
	const nombreImagen = req.params.nombre;
	const rutaImagen = path.join(__dirname, "output", nombreImagen);

	res.sendFile(rutaImagen);
});

const port = 3000;

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

const folderPath = "output";

cron.schedule("31 * * * *", () => {
	console.log("Deleting files");
	// Obtener la fecha actual y restarle 3 horas
	const currentDateTime = new Date();
	const threeHoursAgo = new Date(currentDateTime.getTime() - 3 * 60 * 60 * 1000);
	// Obtener la lista de archivos en la carpeta
	fs.readdirSync(folderPath).forEach(async (file) => {
		// Ignorar el archivo .gitignore
		if (file === ".gitignore") {
			return;
		}

		const filePath = path.join(folderPath, file);

		// Obtener información sobre el archivo
		const stats = fs.statSync(filePath);

		// Verificar si la fecha de modificación es mayor a 3 horas
		if (stats.ctime > threeHoursAgo) {
			console.log(`El archivo ${file} tiene una antigüedad mayor a 3 horas.`);
			// Aquí puedes realizar la lógica adicional que necesites con el archivo
			await unlink(filePath);
		}
	});
});
