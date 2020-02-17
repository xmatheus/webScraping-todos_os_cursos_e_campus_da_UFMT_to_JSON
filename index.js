// pl-scraper.js

const axios = require("axios");
const cheerio = require("cheerio");
var fs = require("fs");

const webScrapping = async () => {
	//coracao do codigo
	const defaultHost = "https://www.ufmt.br";
	const searchUrl =
		"https://www.ufmt.br/ufmt/site/secao/index/Cuiaba/3864/840";
	const response = await axios.get(searchUrl);

	const htmlString = response.data;

	const $ = cheerio.load(htmlString);

	const campusUFMT = [];

	$("#esquerda")
		.find(".caixaslaterais")
		.each((i, el) => {
			const name = $(el)
				.find("h3")
				.text();

			const a = name.split(" ");
			const cityName = a[a.length - 1];

			const href =
				defaultHost +
				$(el)
					.find("#mais")
					.find("a")
					.attr("href");

			campusUFMT.push({
				name,
				cityName,
				href
			});
		});

	$("#direita")
		.find(".caixaslaterais")
		.each((i, el) => {
			const name = $(el)
				.find("h3")
				.text();

			const a = name.split(" ");
			let cityName = a[a.length - 1];

			if (cityName === "Araguaia") {
				cityName = "Barra do Garças";
			}

			const href =
				defaultHost +
				$(el)
					.find("#mais")
					.find("a")
					.attr("href");

			campusUFMT.push({
				name,
				cityName,
				href
			});
		});

	return campusUFMT;
};

const getCursos = async url => {
	const response = await axios.get(url);

	const htmlString = response.data;

	const $ = cheerio.load(htmlString);

	const cursos = [];

	$("#textos")
		.find("ul")
		.each((i, el) => {
			$(el)
				.find("li")
				.each((index, element) => {
					cursos.push(
						$(element)
							.text()
							.split(";")[0]
					);
				});
		});

	if (cursos.length === 0) {
		$("#meio")
			.find("ul")
			.each((i, el) => {
				$(el)
					.find("li")
					.each((index, element) => {
						cursos.push(
							$(element)
								.text()
								.split(";")[0]
						);
					});
			});
	}
	return cursos;
};

const saveJson = files => {
	fs.writeFile("Cursos-UFMT.json", JSON.stringify(files, null, 4), function(
		err
	) {
		if (err) {
			console.log(err);
		}
	});
};

const main = async () => {
	const campus = await webScrapping();
	campusFiltred = [];

	let totalNumberofCourses = 0;
	for (let cmp of campus) {
		const cursos = await getCursos(cmp.href);
		campusFiltred.push({
			name: cmp.name,
			cityName: cmp.cityName,
			courses: cursos,
			numberOfCourses: cursos.length
		});

		totalNumberofCourses += cursos.length;
	}

	campusFiltred.push({ totalNumberofCourses });
	console.log(campusFiltred);
	saveJson(campusFiltred);
};

main();

//json utfpr
//http://dados.utfpr.edu.br/api/3/action/datastore_search?resource_id=270d0fce-380f-4db8-899f-cde38630af9b
