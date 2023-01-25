function login_(form) {
    const data = {
        login: btoa(form.login.value),
        pass: btoa(form.password.value)
    };

    if (data.login.length == 0 || data.pass.length == 0) {
        document.getElementById("response").innerHTML = "Pola nie mogą być puste.";
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.status == 401) {
                document.getElementById("response").innerHTML = "Niepoprawny login lub hasło.";
            } else if (response.status == 200) {
                return response.json();
            }
        })
        .then(response => {
            const key = response.api_key;
            if (key) {
                sessionStorage.setItem("login", data.login);
                sessionStorage.setItem("api key", key);
                window.location.href = "/";
            }
        })
        .catch(e => console.log(e));
}

function register_(form) {
    const data = {
        login: btoa(form.login.value),
        pass: btoa(form.password.value)
    };

    if (data.login.length == 0 || data.pass.length == 0) {
        document.getElementById("response").innerHTML = "Pola nie mogą być puste.";
        return;
    }

    fetch("/register", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.status == 409) {
                document.getElementById("response").innerHTML = "Taki użytkownik już istnieje.";
            } else if (response.status == 200) {
                return response.json();
            }
        })
        .then(response => {
            window.location.href = response.location;
        })
        .catch(e => console.log(e));
}

function logout_() {
    fetch("/login/" + sessionStorage.getItem("login"), {
        method: "DELETE",
        headers: {
            'x-api-key': sessionStorage.getItem("api key")
        }
    })
        .catch(e => console.log(e));
    sessionStorage.removeItem("api key");
    window.location.href = "/login";
}
