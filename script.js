//CHAT GPT WAS USED ON THIS ASSIGNMENT
// Constants for strings used in the HTML content
const PAGE_TITLE = "SQL Query Executor";
const WELCOME_MESSAGE = "Enter your SQL query below. ex: select * from patient";
const TEXTAREA_PLACEHOLDER = "Enter SQL query (SELECT or INSERT only)";
const SUBMIT_BUTTON_TEXT = "Submit Query";
const API_URL = "https://comp4537-lab-5.vercel.app/api/sql";
const BULK_INSERT_BUTTON_TEXT = "Insert Multiple Records";
const DROP_TEST_BUTTON_TEXT = "Test DROP Command";

// Class responsible for generating and manipulating HTML content
class ContentGenerator {
    constructor() {
        this.generateInitialContent();
        this.addSqlQuerySection();
    }

    generateInitialContent() {
        document.title = PAGE_TITLE; // Set the page title

        const body = document.body;
        
        // Add welcome message
        const welcomeElement = document.createElement('h1');
        welcomeElement.textContent = WELCOME_MESSAGE;
        body.appendChild(welcomeElement);
    }

    addSqlQuerySection() {
        const form = document.createElement('form');
        form.id = 'sqlForm';
        document.body.appendChild(form);

        // Create textarea for SQL query input
        const textarea = document.createElement('textarea');
        textarea.placeholder = TEXTAREA_PLACEHOLDER;
        form.appendChild(textarea);

        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = SUBMIT_BUTTON_TEXT;
        submitButton.type = 'button'; // Prevent default form submission
        form.appendChild(submitButton);

        // Add event listener for the submit button
        submitButton.addEventListener('click', () => this.handleSubmit(textarea.value));

        const bulkInsertButton = document.createElement('button');
        bulkInsertButton.textContent = BULK_INSERT_BUTTON_TEXT;
        bulkInsertButton.type = 'button'; // Prevent default form submission
        document.body.appendChild(bulkInsertButton);

        // Add event listener for the bulk insert button
        bulkInsertButton.addEventListener('click', () => this.handleBulkInsert());

        // Create and setup DROP test button
        const dropTestButton = document.createElement('button');
        dropTestButton.textContent = DROP_TEST_BUTTON_TEXT;
        dropTestButton.type = 'button';
        document.body.appendChild(dropTestButton);

        // Add event listener for the DROP test button
        dropTestButton.addEventListener('click', () => this.handleDropTest());
    }

    async handleBulkInsert() {
        const records = [
            { name: 'Sara Brown', dateOfBirth: '1901-01-01' },
            { name: 'John Smith', dateOfBirth: '1941-01-01' },
            { name: 'Jack Ma', dateOfBirth: '1961-01-30' },
            { name: 'Elon Musk', dateOfBirth: '1999-01-01' },
        ];

        // Assuming a single INSERT per record for simplicity. Adjust according to your API's capability to handle bulk inserts.
        for (const record of records) {
            const query = `INSERT INTO patient (name, dateOfBirth) VALUES ('${record.name}', '${record.dateOfBirth}')`;
            await this.handleSubmit(query); // Reusing handleSubmit for inserting records
        }
    }

    async handleSubmit(query) {
        const method = this.determineMethod(query);
        let apiUrl = API_URL;

        try {
            let fetchOptions = {
                method: method,
                headers: {},
            };

            if (method === 'GET') {
                apiUrl += `?query=${encodeURIComponent(query)}`;
            } else if (method === 'POST') {
                fetchOptions.headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify({ query: query });
            }

            // Perform the fetch request to the API
            const response = await fetch(apiUrl, fetchOptions);
            const data = await response.json(); // Assuming the server responds with JSON

            // Display the server's response
            this.displayResponse(data);
        } catch (error) {
            console.error('Error fetching data: ', error);
            this.displayResponse('An error occurred. Please check the console.');
        }
    }
    /**
     * This button was added because the front end already covers for people sending
     * the wrong type of input, so this button bypasses it and shows the error
     */
    async handleDropTest() {
        console.log("drop attempted")
        const dropCommand = "DROP TABLE patient"; // Example command, adjust based on your needs

        // Using the handleSubmit method to send the command might not work as intended since it's designed for SELECT and INSERT
        // Instead, directly send a POST request with the DROP command to test server response to unauthorized actions
        try {
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: dropCommand })
            };

            const response = await fetch(API_URL, fetchOptions);
            const data = await response.json();

            // Display the server's response to the DROP command attempt
            this.displayResponse(data);
        } catch (error) {
            console.error('Error attempting DROP command: ', error);
            this.displayResponse(`An error occurred while attempting the DROP command.\n ${error}`);
        }
    }

    determineMethod(query) {
        // Determine if the query is a SELECT or INSERT operation
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            return 'GET';
        } else if (query.trim().toUpperCase().startsWith('INSERT')) {
            return 'POST';
        } else {
            throw new Error('Unsupported query type. Only SELECT and INSERT are supported.');
        }
    }

    displayResponse(data) {
        let responseContainer = document.getElementById('responseContainer');
        if (!responseContainer) {
            responseContainer = document.createElement('div');
            responseContainer.id = 'responseContainer';
            document.body.appendChild(responseContainer);
        }

        // Check if the response is for a SELECT query and call displayQueryResults
        try {
            //console.log(data.result.command)
            if (data && data.status === "ok" && data.result.command === "SELECT") {
                this.displayQueryResults(data);
                return; // Prevent further processing in this method
            } else {
                console.log("Drop denied by server")
            }
        } catch (error) {
            console.error('Error processing server response: ', error);
        }

        // For other types of responses or errors, just display the raw response
        responseContainer.textContent = JSON.stringify(data);
    }

    displayQueryResults(data) {
        // Create the table and thead elements
        const table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Define the table headers
        const headers = ['Patient ID', 'Name', 'Date of Birth'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create and append tbody element
        const tbody = document.createElement('tbody');
        data.result.rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.patientid}</td><td>${row.name}</td><td>${new Date(row.dateofbirth).toLocaleDateString()}</td>`;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        // Append the table to the body or to a specific element
        document.body.appendChild(table);
    }

    
}

// Instantiate the ContentGenerator to kick off content creation
new ContentGenerator();
