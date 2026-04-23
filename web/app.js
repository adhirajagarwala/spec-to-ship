const notes = document.querySelector("#notes");
const output = document.querySelector("#output");
const button = document.querySelector("#generate");

button.addEventListener("click", async () => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: notes.value })
  });
  output.textContent = JSON.stringify(await response.json(), null, 2);
});
