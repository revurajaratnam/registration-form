const text = document.createElement("b")
text.textContent="Hi Friendses";

document.body.append(text)
const paragraph = document.createElement("p");
paragraph.textContent="I am learning JavaScript DOM"
const button = document.createElement("button");
        button.textContent ="Click Me"
    document.body.append(paragraph, button)