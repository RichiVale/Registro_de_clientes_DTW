const formulario = document.getElementById("loginForm");

formulario.addEventListener("submit", function (e) {

    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();

    if (usuario === "") {

        alert("Escribe un nombre de usuario.");

        return;

    }

    alert("Bienvenido, " + usuario);

    window.location.href = "../menu/index.html";

});
