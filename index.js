const express = require("express");
const bodyParser = require("body-parser");
const pdf2pic = require("pdf2pic");
const fs = require("fs-extra");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/convertir", async (req, res) => {
	const pdfBuffer = req.body.pdf;
	const outputFolder = "output";
	const options = {
		density: 100,
		saveFolder: outputFolder,
		format: "jpg",
		width: 2480,
		height: 3508,
	};
	const converter = pdf2pic.fromBuffer(pdfBuffer, options);
	await converter.bulk(-1, false);
	//const pages = await converter.convert();

	const images = [];

	for (let i = 0; i < pages.length; i++) {
		const filename = `page-${i + 1}.jpg`;
		const filepath = `${outputFolder}/${filename}`;
		await fs.writeFile(filepath, pages[i]);
		images.push(filename);
	}

	res.json({ images });
});

const port = 3000;

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
