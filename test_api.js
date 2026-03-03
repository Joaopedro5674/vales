const fetch = require('node-fetch');

async function test() {
    const url = "https://script.google.com/macros/s/AKfycbwiXXrnnrts4DrbuJfjL663NurzJreN8x4zwAx6bJFCHbqJPLUBi3eVGA81PUK0h8U61A/exec";
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ acao: "verificar", id_vale: "VR-01" })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
}

test();
