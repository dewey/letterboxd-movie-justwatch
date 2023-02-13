const form = document.getElementById("movie-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the form from submitting normally

  console.log(event.target);
  const formData = new FormData(event.target);

  const data = Object.fromEntries(formData.entries());
  console.log(data);

  // const url = "/api/helloworld";
  const url = "/api/search-movie";

  // Perform the fetch request
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const errorMessage = document.getElementById("error-message");
      const resultMessage = document.getElementById("result-message");
      if (data.error) {
        errorMessage.innerHTML = data.error;
        resultMessage.innerHTML = "";
      } else {
        errorMessage.innerHTML = "";
        resultMessage.innerHTML = JSON.stringify(data);
      }
    })
    .catch((error) => console.error(error));
});
