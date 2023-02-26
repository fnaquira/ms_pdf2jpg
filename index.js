const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { fromPath } = require("pdf2pic");
const { writeFileSync, unlink } = require("fs-extra");
const asyncForEach = require("asyncforeach_pe");

const multer = require("multer");

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
		if (file.mimetype !== "application/pdf") {
			return cb(new Error("Solo se permiten archivos de PDF"));
		}
		cb(null, true);
	},
});

const app = express();

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

app.get("/imagenes/:nombre", (req, res) => {
	const nombreImagen = req.params.nombre;
	const rutaImagen = path.join(__dirname, "output", nombreImagen);

	res.sendFile(rutaImagen);
});

const port = 3000;

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
