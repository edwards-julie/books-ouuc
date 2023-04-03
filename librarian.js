let titleInput
let authorInput
let descriptionInput
let links
let output
let keywords
let priceInput
let photos

function defineObjects() {
    titleInput = document.getElementById("title-input")
    authorInput = document.getElementById("author-input")
    descriptionInput = document.getElementById("description-input")
    links = document.getElementById("links")
    output = document.getElementById('output')
    keywords = document.getElementById("keywords-input")
    priceInput = document.getElementById("price-input")
    photos = document.getElementById("photos")
}

function formatAuthorNames(authors) {
    let formattedAuthors = '';
    console.log(authors)
    // Format the first author
    if (authors[0]) {
        let authorParts = authors[0].split(' ');
        let firstName = authorParts[0];
        let lastName = authorParts[authorParts.length - 1];
        let middleNames = authorParts.slice(1, authorParts.length - 1).join(' ');
        formattedAuthors = `${lastName}, ${firstName} ${middleNames}`;
    }

    // Add the remaining authors
    if (authors.length > 1) {
        formattedAuthors += ` and ${authors[1]}`
    }
    if (authors.length > 2) {
        formattedAuthors += ', et al.'
    }

    return formattedAuthors;
}

function extractYear(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    return year;
}

function copyToClipboard() {
    navigator.clipboard.writeText(output.value)
        .then(() => { })
        .catch(err => {
            console.error("Failed to copy text: ", err);
        });
}


function generate() {
    let outputText = `${titleInput.value}{${authorInput.value}{${descriptionInput.value}{${keywords.value}{${bookData.isbn}{${priceInput.value}`

    console.log(outputText)
    output.value = outputText;
}

function clearAndFocus() {
    var input = document.getElementById("isbn-input");
    input.value = "";
    input.focus();

    titleInput.value = '';
    authorInput.value = '';
    descriptionInput.value = '';
    links.innerHTML = '';
    output.value = '';
    photos.innerHTML = '';
}


function formatBookInfo(googleBookData, isbn) {
    bookData = {
        title: googleBookData.title,
        author: formatAuthorNames(googleBookData.authors),
        description: googleBookData.description,
        isbn: isbn
    }
    return bookData;
}

// Define a function to fetch book information from an API using ISBN
async function fetchBookInfo(isbn) {
    console.log(isbn)
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();
    bookData = data.items[0].volumeInfo;
    console.log(bookData)
    return formatBookInfo(bookData, isbn);
}

// Listen for submit event on ISBN form
document.getElementById("isbn-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const isbn = document.getElementById("isbn-input").value;

    if (isbn.length >= 10) {
        const bookData = await fetchBookInfo(isbn);

        // Populate fields in book form using bookData
        document.getElementById("title-input").value = bookData.title;
        document.getElementById("author-input").value = bookData.author;
        document.getElementById("description-input").value = bookData.description;
        document.getElementById("links").innerHTML = `
            <p><a href=https://www.amazon.com/s?i=stripbooks&rh=p_66%3A${isbn}&s=relevanceexprank&Adv-Srch-Books-Submit.x=35&Adv-Srch-Books-Submit.y=12&unfiltered=1&ref=sr_adv_b" target="_blank">Amazon</a>
            <p><a href=https://www.ebay.com/sh/research?marketplace=EBAY-US&keywords=${isbn}&dayRange=90&endDate=1680216616964&startDate=1672444216964&categoryId=0&offset=0&limit=50&tabName=SOLD&tz=America%2FLos_Angeles" target="_blank">Ebay</a>
        `;
        // google api thumbnail: <img src="${bookData.imageLinks?.thumbnail}">
        photos.innerHTML = `
            <img src="https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg">
        `
    }
});

// Listen for submit event on book form
document.getElementById("book-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Create JSON object with form data
    const formData = {
        title: document.getElementById("title-input").value,
        author: document.getElementById("author-input").value,
        description: document.getElementById("description-input").value,
        keywords: document.getElementById("keywords-input").value,
        price: document.getElementById("price-input").value
    };
    console.log(formData);
});

window.addEventListener("load", function () {
    document.getElementById("isbn-input").focus();
    defineObjects()
});