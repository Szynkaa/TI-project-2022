var saves = [];

function save_() {
    const data = {
        sortName: document.getElementById("sortType").value,
        n: document.getElementById("n").value
    };
    fetch("/saves/" + sessionStorage.getItem("login"), {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionStorage.getItem("api key")
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.status == 201) {
                alert("zapisano");
            }
        })
        .catch(e => console.log(e));
}

function load_() {
    fetch("/saves/" + sessionStorage.getItem("login"), {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': sessionStorage.getItem("api key")
        }
    })
        .then(response => {
            if (response.status == 200) {
                return response.json();
            }
        })
        .then(data => {
            console.log(data);
            saves.length = 0;
            if (data.saves.length == 0) {
                alert("brak zapisów");
            } else {
                saves = data.saves;
                console.log(saves);

                const select = document.getElementById("loadedSaves");
                select.style.display = "block";
                while (select.hasChildNodes()) {
                    select.removeChild(select.firstChild);
                }

                for (let i = 0; i < saves.length; i++) {
                    const option = document.createElement("option");
                    option.setAttribute("value", i)
                    const name = document.getElementById("sortType").options.namedItem(saves[i].sortName).innerText;
                    option.innerText = `${name}, N:${saves[i].n}`;
                    select.appendChild(option);
                }
            }
        })
        .catch(e => console.log(e));
}

function clear_() {
    console.log("clear");
    fetch("/saves/" + sessionStorage.getItem("login"), {
        method: "DELETE",
        headers: {
            'x-api-key': sessionStorage.getItem("api key")
        }
    })
        .then(response => {
            if (response.status == 200) {
                document.getElementById("loadedSaves").style.display = "none";
                alert("usunięto");
            }
        })
        .catch(e => console.log(e));
}

function updateSortFromLoaded() {
    const index = document.getElementById("loadedSaves").value;
    const { sortName, n } = saves.at(index);
    document.getElementById("sortType").value = sortName;
    document.getElementById("n").value = n;
    sortOrNChange();
}
