console.log("loaded!");
const input = document.getElementById("fileInput");
const attached = document.getElementById("attached");
attached.onclick = () => input.click();

input.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if(!file) return;

  const form = new FormData();
  form.append("schem", file);
  const res = await fetch("/upload", {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  console.log(json);
});