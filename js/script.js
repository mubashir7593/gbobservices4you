/* =========================================================
   GBOB SERVICES 4 YOU
   PUBLISHER DATABASE
   ========================================================= */


/* ================= SETTINGS ================= */

const WHATSAPP_NUMBER = "https://wa.me/+923234424639";


const GOOGLE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRikIr5e-Z7Sjp3jKxYm69fxD_ypqU_2NngUvZOcg0-ibSCJNfZPnl7tlvIEex3L9RH82DPBmEGLL-X/pub?gid=0&single=true&output=csv";


/* ================= GLOBAL DATA ================= */

let publishers = [];

let filteredPublishers = [];


/* ================= DOM ELEMENTS ================= */

const publisherBody =
    document.getElementById("publisher-body");

const publisherCount =
    document.getElementById("publisher-count");

const publisherSearch =
    document.getElementById("publisher-search");

const publisherResults =
    document.getElementById("publisher-results");


/* =========================================================
   CSV PARSER
   Handles commas inside quoted values
   ========================================================= */

function parseCSV(csvText) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < csvText.length; i++) {

        const character = csvText[i];

        const nextCharacter =
            csvText[i + 1];


        /* Double quote */

        if (character === '"') {

            if (
                insideQuotes &&
                nextCharacter === '"'
            ) {

                value += '"';

                i++;

            } else {

                insideQuotes = !insideQuotes;
            }

        }


        /* Comma */

        else if (
            character === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

        }


        /* New line */

        else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {

            if (
                character === "\r" &&
                nextCharacter === "\n"
            ) {
                i++;
            }

            row.push(value);

            value = "";

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];

        }


        /* Normal character */

        else {

            value += character;
        }
    }


    /* Add final value */

    if (value !== "" || row.length > 0) {

        row.push(value);

        if (row.some(cell => cell.trim() !== "")) {
            rows.push(row);
        }
    }


    return rows;
}


/* =========================================================
   NORMALIZE HEADER
   ========================================================= */

function normalizeHeader(header) {

    return String(header || "")
        .replace(/\uFEFF/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}


/* =========================================================
   FIND COLUMN
   ========================================================= */

function findColumn(headers, possibleNames) {

    for (const name of possibleNames) {

        const index =
            headers.indexOf(
                normalizeHeader(name)
            );

        if (index !== -1) {
            return index;
        }
    }

    return -1;
}


/* =========================================================
   FIND HEADER ROW
   ========================================================= */

function findHeaderRow(rows) {

    return rows.findIndex(row => {

        return row.some(cell => {

            return (
                normalizeHeader(cell) ===
                "websiteurl"
            );

        });

    });
}


/* =========================================================
   CLEAN URL
   ========================================================= */

function normalizeUrl(url) {

    let cleanUrl =
        String(url || "").trim();


    if (!cleanUrl) {
        return "#";
    }


    if (
        !cleanUrl.startsWith("http://") &&
        !cleanUrl.startsWith("https://")
    ) {

        cleanUrl =
            "https://" + cleanUrl;
    }


    return cleanUrl;
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    const cleanStatus =
        String(status || "")
            .trim()
            .toLowerCase();


    if (
        cleanStatus.includes("available") ||
        cleanStatus.includes("active") ||
        cleanStatus.includes("yes") ||
        cleanStatus.includes("live")
    ) {

        return "status-available";
    }


    if (
        cleanStatus.includes("unavailable") ||
        cleanStatus.includes("inactive") ||
        cleanStatus.includes("no") ||
        cleanStatus.includes("sold")
    ) {

        return "status-unavailable";
    }


    return "status-default";
}


/* =========================================================
   CREATE TABLE CELL
   ========================================================= */

function createCell(text) {

    const cell =
        document.createElement("td");

    cell.textContent =
        String(text || "").trim();

    return cell;
}


/* =========================================================
   CREATE WEBSITE CELL
   ========================================================= */

function createWebsiteCell(url) {

    const cell =
        document.createElement("td");


    const link =
        document.createElement("a");


    const cleanUrl =
        normalizeUrl(url);


    link.href = cleanUrl;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.className =
        "publisher-website";

    link.textContent =
        String(url || "").trim();


    cell.appendChild(link);


    return cell;
}


/* =========================================================
   CREATE STATUS CELL
   ========================================================= */

function createStatusCell(status) {

    const cell =
        document.createElement("td");


    const badge =
        document.createElement("span");


    badge.className =
        "status-badge " +
        getStatusClass(status);


    badge.textContent =
        String(status || "N/A").trim();


    cell.appendChild(badge);


    return cell;
}


/* =========================================================
   CREATE ORDER BUTTON
   ========================================================= */

function createOrderCell(publisher) {

    const cell =
        document.createElement("td");


    const button =
        document.createElement("a");


    const message =
        `Hello gbobservices4you,

I want to place an order for the following website.

Website: ${publisher.website}

Niche: ${publisher.niche}

MOZ DA: ${publisher.mozDA}

AS: ${publisher.as}

Traffic: ${publisher.traffic}

TAT: ${publisher.tat}

Link Type: ${publisher.linkType}

Price: ${publisher.price}

Status: ${publisher.status}`;


    const whatsappUrl =
        `https://wa.me/+923234424639?text=${encodeURIComponent(message)}`;


    button.href =
        whatsappUrl;

    button.target =
        "_blank";

    button.rel =
        "noopener noreferrer";

    button.className =
        "order-btn";

    button.textContent =
        "Order";


    cell.appendChild(button);


    return cell;
}


/* =========================================================
   RENDER PUBLISHERS
   ========================================================= */

function renderPublishers(data) {

    publisherBody.innerHTML = "";


    if (!data.length) {

        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");


        cell.colSpan = 10;

        cell.className =
            "table-message";

        cell.textContent =
            "No publishers found.";


        row.appendChild(cell);

        publisherBody.appendChild(row);

        return;
    }


    const fragment =
        document.createDocumentFragment();


    data.forEach(publisher => {

        const row =
            document.createElement("tr");


        /* Website */

        row.appendChild(
            createWebsiteCell(
                publisher.website
            )
        );


        /* Niche */

        row.appendChild(
            createCell(
                publisher.niche
            )
        );


        /* MOZ DA */

        row.appendChild(
            createCell(
                publisher.mozDA
            )
        );


        /* AS */

        row.appendChild(
            createCell(
                publisher.as
            )
        );


        /* Traffic */

        row.appendChild(
            createCell(
                publisher.traffic
            )
        );


        /* TAT */

        row.appendChild(
            createCell(
                publisher.tat
            )
        );


        /* Link Type */

        row.appendChild(
            createCell(
                publisher.linkType
            )
        );


        /* Price */

        row.appendChild(
            createCell(
                publisher.price
            )
        );


        /* Status */

        row.appendChild(
            createStatusCell(
                publisher.status
            )
        );


        /* Order */

        row.appendChild(
            createOrderCell(
                publisher
            )
        );


        fragment.appendChild(row);

    });


    publisherBody.appendChild(fragment);
}


/* =========================================================
   UPDATE RESULT TEXT
   ========================================================= */

function updateResultText() {

    const total =
        publishers.length;

    const showing =
        filteredPublishers.length;


    if (!publisherResults) {
        return;
    }


    if (showing === total) {

        publisherResults.textContent =
            `Showing all ${total} publishers`;

    } else {

        publisherResults.textContent =
            `Showing ${showing} of ${total} publishers`;
    }
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchPublishers(searchTerm) {

    const term =
        String(searchTerm || "")
            .trim()
            .toLowerCase();


    if (!term) {

        filteredPublishers =
            [...publishers];

    } else {

        filteredPublishers =
            publishers.filter(publisher => {

                const searchableText = [

                    publisher.website,

                    publisher.niche,

                    publisher.mozDA,

                    publisher.as,

                    publisher.traffic,

                    publisher.tat,

                    publisher.linkType,

                    publisher.price,

                    publisher.status

                ]
                .join(" ")
                .toLowerCase();


                return searchableText.includes(term);

            });
    }


    renderPublishers(
        filteredPublishers
    );


    updateResultText();
}


/* =========================================================
   LOAD GOOGLE SHEET
   ========================================================= */

async function loadPublishers() {

    try {

        if (!publisherBody) {
            return;
        }


        publisherBody.innerHTML = "";


        const loadingRow =
            document.createElement("tr");


        const loadingCell =
            document.createElement("td");


        loadingCell.colSpan = 10;

        loadingCell.className =
            "table-message";

        loadingCell.textContent =
            "Loading publisher data...";


        loadingRow.appendChild(
            loadingCell
        );


        publisherBody.appendChild(
            loadingRow
        );


        /* Fetch CSV */

        const response =
            await fetch(
                GOOGLE_SHEET_CSV_URL,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP error: ${response.status}`
            );
        }


        const csvText =
            await response.text();


        if (!csvText.trim()) {

            throw new Error(
                "Google Sheet returned empty data."
            );
        }


        /* Parse CSV */

        const rows =
            parseCSV(csvText);


        if (!rows.length) {

            throw new Error(
                "No rows found in Google Sheet."
            );
        }


        /* Find actual header row */

        const headerRowIndex =
            findHeaderRow(rows);


        if (headerRowIndex === -1) {

            throw new Error(
                "Website URL column was not found."
            );
        }


        const headers =
            rows[headerRowIndex]
                .map(normalizeHeader);


        /* Find columns */

        const websiteIndex =
            findColumn(
                headers,
                [
                    "Website URL",
                    "Website",
                    "URL",
                    "Site",
                    "Domain"
                ]
            );


        const nicheIndex =
            findColumn(
                headers,
                [
                    "Niche",
                    "niche",
                    "Category",
                    "Topic"
                ]
            );


        const mozDAIndex =
            findColumn(
                headers,
                [
                    "MOZ DA",
                    "DA",
                    "Domain Authority"
                ]
            );


        const asIndex =
            findColumn(
                headers,
                [
                    "AS",
                    "Authority Score",
                    "Semrush AS"
                ]
            );


        const trafficIndex =
            findColumn(
                headers,
                [
                    "TRAFFIC",
                    "Traffic",
                    "Organic Traffic"
                ]
            );


        const tatIndex =
            findColumn(
                headers,
                [
                    "TAT",
                    "Turnaround Time",
                    "Delivery Time"
                ]
            );


        const linkTypeIndex =
            findColumn(
                headers,
                [
                    "Link type",
                    "Link Type",
                    "Type",
                    "Link"
                ]
            );


        const priceIndex =
            findColumn(
                headers,
                [
                    "Price",
                    "Cost",
                    "Rate"
                ]
            );


        const statusIndex =
            findColumn(
                headers,
                [
                    "Status",
                    "Availability"
                ]
            );


        /* Website URL is required */

        if (websiteIndex === -1) {

            throw new Error(
                "Website URL column could not be detected."
            );
        }


        /* Convert rows into publisher objects */

        publishers =
            rows
                .slice(headerRowIndex + 1)
                .map(row => {

                    return {

                        website:
                            row[websiteIndex] || "",

                        niche:
                            nicheIndex !== -1
                                ? row[nicheIndex] || ""
                                : "",

                        mozDA:
                            mozDAIndex !== -1
                                ? row[mozDAIndex] || ""
                                : "",

                        as:
                            asIndex !== -1
                                ? row[asIndex] || ""
                                : "",

                        traffic:
                            trafficIndex !== -1
                                ? row[trafficIndex] || ""
                                : "",

                        tat:
                            tatIndex !== -1
                                ? row[tatIndex] || ""
                                : "",

                        linkType:
                            linkTypeIndex !== -1
                                ? row[linkTypeIndex] || ""
                                : "",

                        price:
                            priceIndex !== -1
                                ? row[priceIndex] || ""
                                : "",

                        status:
                            statusIndex !== -1
                                ? row[statusIndex] || ""
                                : ""

                    };

                })


                /* Remove empty rows */

                .filter(
                    publisher =>
                        publisher.website.trim() !== ""
                );


        /* Actual publisher count */

        publisherCount.textContent =
            publishers.length;


        /* Initial data */

        filteredPublishers =
            [...publishers];


        renderPublishers(
            filteredPublishers
        );


        updateResultText();


        console.log(
            `Loaded ${publishers.length} publishers from Google Sheet.`
        );

    }


    catch (error) {

        console.error(
            "Publisher loading error:",
            error
        );


        publisherCount.textContent =
            "0";


        if (publisherResults) {

            publisherResults.textContent =
                "Unable to load publisher data.";
        }


        publisherBody.innerHTML = "";


        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");


        cell.colSpan = 10;

        cell.className =
            "table-message";


        cell.textContent =
            "Unable to load publisher data. Please make sure the Google Sheet is published to the web as CSV.";


        row.appendChild(cell);

        publisherBody.appendChild(row);

    }
}


/* =========================================================
   SEARCH EVENT
   ========================================================= */

if (publisherSearch) {

    publisherSearch.addEventListener(
        "input",
        function () {

            searchPublishers(
                this.value
            );

        }
    );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPublishers();

    }
);

// Form reset after submit
const contactForm = document.querySelector('form.form-card');
if (contactForm) {
    contactForm.addEventListener('submit', function () {
        setTimeout(() => {
            contactForm.reset();
        }, 500);
    });
}