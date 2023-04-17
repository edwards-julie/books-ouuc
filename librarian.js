let titleInput
let authorInput
let descriptionInput
let links
let output
let keywords
let photos
let checkboxContainer
let checkboxes

// defines objects
function defineObjects() {
    titleInput = document.getElementById("title-input")
    authorInput = document.getElementById("author-input")
    descriptionInput = document.getElementById("description-input")
    links = document.getElementById("links")
    output = document.getElementById('output')
    keywords = document.getElementById("keywords-input")
    photos = document.getElementById("photos")
    checkboxContainer = document.getElementById('checkbox-container');
    checkboxes = document.getElementsByName('checkbox');
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

    // Add the second author, and 'et al.'
    if (authors.length > 1) {
        formattedAuthors += ` and ${authors[1]}`
    }
    if (authors.length > 2) {
        formattedAuthors += ', et al.'
    }

    return formattedAuthors;
}

function extractYear(dateString) {
    let dateObj;
    if (dateString.length === 4) {
        return dateString;
    } else {
        dateObj = new Date(dateString);
    }
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
    if (!titleInput.value) {
        alert('Please select a book.')
    } else {
        let outputText = `${titleInput.value}{${authorInput.value}{${descriptionInput.value}{${getCheckedValues()}{${bookData.isbn}`
        console.log(outputText)
        getCheckedValues()
        output.value = outputText;
    }

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

    checkboxes.forEach(x => {
        x.checked = false
    })
}

const checkboxValues = [
    'Featured',
    'LP',
    'Graphic-Novel',
    'NW',
    'Holiday',
    'Signed',
    'Justice',
    'True-Crime',
    'LGBTQ',
    'Women'
];

function renderCheckboxes() {
    //checkboxValues.sort();
    const numColumns = 2;
    const numRows = Math.ceil(checkboxValues.length / numColumns);
    const checkboxTemplate = document.createElement('template');
    checkboxTemplate.innerHTML = `<div class="checkbox-column"></div>`;
    for (let i = 0; i < numColumns; i++) {
        checkboxContainer.appendChild(checkboxTemplate.content.cloneNode(true));
    }
    const columns = document.getElementsByClassName('checkbox-column');
    let index = 0;
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numColumns; j++) {
            if (index < checkboxValues.length) {
                const checkboxLabel = checkboxValues[index];
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'checkbox';
                checkbox.value = checkboxLabel;
                const label = document.createElement('label');
                label.textContent = checkboxLabel;
                label.classList.add('checkbox-label');
                columns[j].appendChild(checkbox);
                columns[j].appendChild(label);
                index++;
            }
        }
    }
}

function getCheckedValues() {
    const checkedValues = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkedValues.push(checkboxes[i].value);
        }
    }
    return checkedValues.join('; ');
}



function formatBookInfo(googleBookData, isbn) {
    const subtitle = googleBookData.subtitle ? `: ${googleBookData.subtitle}` : '';
    const formattedTitle = `${googleBookData.title}${subtitle}`
    bookData = {
        title: formattedTitle,
        author: formatAuthorNames(googleBookData.authors),
        description: `${extractYear(googleBookData.publishedDate)} - ${googleBookData.description}`,
        isbn: isbn
    }
    return bookData;
}

async function getImages(isbn) {
    const hrefs = await getGoogleImageSearchResult(isbn)
    addImages(hrefs)
}

function addImages(hrefs) {
    console.log(hrefs)
    hrefs.forEach(x => {
        photos.innerHTML += `<img src="${x}" />`
    })
    setTimeout(() => {
        const images = Array.from(document.querySelectorAll('#photos img'))
        images.forEach(x => {
            let info = document.createElement('span')
            info.textContent = `${x.naturalWidth}x${x.naturalHeight}`;
            photos.insertBefore(info, x)
        })
    }, 1000);
    
}

// Define a function to fetch book information from an API using ISBN
async function fetchBookInfo(isbn) {
    console.log(isbn)
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();
    getImages(isbn)
    bookData = data.items[0].volumeInfo;
    console.log(bookData)
    return formatBookInfo(bookData, isbn);
}

async function getGoogleImageSearchResult(isbn) {
    var numberOfResults = 4;

    // API credentials
    var apikey = "AIzaSyAeCBGyZIj2L5YG_bISvAqW86jR3TNKQMo";
    var searchEngineID = "511ac3198aa8e497a";

    // Building call to API
    var url = "https://www.googleapis.com/customsearch/v1?key=" + apikey + "&cx=" + searchEngineID
        + "&q=" + isbn + "&num=10&searchType=image";
    console.log(url);
    
    const response = await fetch(url);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const urls = data.items.map(x => {
        if (x.link && x.link.includes('.jpg')) return `${x.link.split('.jpg')[0]}.jpg`
    }).filter(x => x)
    console.log(urls);
    
    return urls.slice(0, numberOfResults);
}

// Listen for submit event on ISBN form
document.getElementById("isbn-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const isbn = document.getElementById("isbn-input").value;

    if (isbn.length >= 10) {
        try {


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
        //     photos.innerHTML += `
        //     <img src="https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg">
        // `
        } catch (error) {
            alert('ISBN not recognized.')
        }
    } else {
        alert('Please enter a book ISBN.')
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
    };
    console.log(formData);
});

window.addEventListener("load", function () {
    document.getElementById("isbn-input").focus();
    defineObjects()
    renderCheckboxes()
});
