const formulario = document.getElementById("loginForm");

formulario.addEventListener("submit", function (e) {

    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();

    const password = document.getElementById("password").value.trim();

    if (usuario === "" || password === "") {

        alert("Complete todos los campos.");

        return;

    }

    // Simulación de inicio de sesión correcto

    window.location.href = "menu/index.html";

});