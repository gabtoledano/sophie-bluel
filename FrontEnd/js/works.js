async function getWorks() {
  const url = "http://localhost:5678/api/works";
  try {
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des works");
    }

    const json = await reponse.json();
    console.log(json);
    for (let i = 0; i < json.length; i++) {
      setFigure(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
}
getWorks();

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src=${data.imageUrl} alt=${data.title}>
							<figcaption>${data.title}</figcaption>`;

  document.querySelector(".gallery").append(figure);
}
