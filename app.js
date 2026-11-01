let products = [];

let purchases = [];

let editingPurchaseId = null;

const currency = "Rs.";


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await openDatabase();

        setDefaultDates();

        setupEvents();

        await refreshAll();

    }
);


/* =====================================================
   DATE FUNCTIONS
===================================================== */

function todayString() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


function monthString() {

    return todayString()
        .substring(
            0,
            7
        );

}


function formatDate(dateString) {

    if (!dateString)
        return "";


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function getMonthName(month) {

    const parts =
        month.split("-");


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            1
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   MONEY
===================================================== */

function money(value) {

    return `${currency} ${Number(
        value || 0
    ).toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.style.display =
        "block";


    setTimeout(
        () => {

            toast.style.display =
                "none";

        },
        2500
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupEvents() {


    document
        .querySelectorAll(".tab")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.page
                        );

                    }
                );

            }
        );


    document
        .getElementById(
            "productForm"
        )
        .addEventListener(
            "submit",
            saveProduct
        );


    document
        .getElementById(
            "purchaseForm"
        )
        .addEventListener(
            "submit",
            savePurchase
        );


    document
        .getElementById(
            "purchaseQuantity"
        )
        .addEventListener(
            "input",
            calculatePurchaseTotal
        );


    document
        .getElementById(
            "purchasePrice"
        )
        .addEventListener(
            "input",
            calculatePurchaseTotal
        );


    document
        .getElementById(
            "purchaseProduct"
        )
        .addEventListener(
            "change",
            productSelected
        );


    document
        .getElementById(
            "historyDate"
        )
        .addEventListener(
            "change",
            renderHistory
        );


    document
        .getElementById(
            "historySearch"
        )
        .addEventListener(
            "input",
            renderHistory
        );


    document
        .getElementById(
            "reportMonth"
        )
        .addEventListener(
            "change",
            renderReports
        );

}


function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(
            page =>
                page.classList.remove(
                    "active"
                )
        );


    document
        .querySelectorAll(".tab")
        .forEach(
            tab =>
                tab.classList.remove(
                    "active"
                )
        );


    const page =
        document.getElementById(
            pageName
        );


    if (page) {

        page.classList.add(
            "active"
        );

    }


    const tab =
        document.querySelector(
            `.tab[data-page="${pageName}"]`
        );


    if (tab) {

        tab.classList.add(
            "active"
        );

    }


    if (
        pageName ===
        "dashboard"
    ) {

        renderDashboard();

    }


    if (
        pageName ===
        "purchases"
    ) {

        renderRecentPurchases();

    }


    if (
        pageName ===
        "history"
    ) {

        renderHistory();

    }


    if (
        pageName ===
        "products"
    ) {

        renderProducts();

    }


    if (
        pageName ===
        "reports"
    ) {

        renderReports();

    }

}


window.showPage =
    showPage;


/* =====================================================
   DEFAULT DATES
===================================================== */

function setDefaultDates() {

    document.getElementById(
        "purchaseDate"
    ).value =
        todayString();


    document.getElementById(
        "historyDate"
    ).value =
        todayString();


    document.getElementById(
        "reportMonth"
    ).value =
        monthString();


    document.getElementById(
        "dashboardDate"
    ).textContent =
        formatDate(
            todayString()
        );

}


/* =====================================================
   REFRESH
===================================================== */

async function refreshAll() {

    products =
        await getProducts();


    purchases =
        await getPurchases();


    populateProductSelect();

    renderDashboard();

    renderRecentPurchases();

    renderHistory();

    renderProducts();

    renderReports();

}


/* =====================================================
   PRODUCTS
===================================================== */

async function saveProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();


    const category =
        document
            .getElementById(
                "productCategory"
            )
            .value;


    const unit =
        document
            .getElementById(
                "productUnit"
            )
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById(
                    "productPrice"
                )
                .value ||
                0
        );


    if (!name) {

        showToast(
            "Please enter a product name."
        );

        return;

    }


    const existing =
        products.find(
            p =>
                p.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (existing) {

        showToast(
            "This product already exists."
        );

        return;

    }


    await addProduct({

        name,

        category,

        unit,

        price,

        createdAt:
            new Date().toISOString()

    });


    document
        .getElementById(
            "productForm"
        )
        .reset();


    await refreshAll();


    showToast(
        "Product added successfully."
    );

}


function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (
        products.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">

                📦

                <br><br>

                No products yet.

                <br>

                Add Milk, Rice, Sugar,
                Shampoo, etc.

            </div>
            `;

        return;

    }


    const sorted =
        [...products].sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


    container.innerHTML =
        sorted
            .map(
                product => `

                <div class="product-row">

                    <div class="row-main">

                        <div>

                            <div class="row-title">

                                📦
                                ${escapeHTML(
                                    product.name
                                )}

                            </div>

                            <div class="row-details">

                                ${escapeHTML(
                                    product.category
                                )}

                                •

                                ${
                                    escapeHTML(
                                        product.unit ||
                                        "Unit"
                                    )
                                }

                                •

                                Default price:
                                ${money(
                                    product.price
                                )}

                            </div>

                        </div>


                        <div class="row-actions">

                            <button
                                class="small-btn edit-btn"
                                onclick="editProduct(${product.id})"
                            >
                                ✏️ Edit
                            </button>

                            <button
                                class="small-btn delete-btn"
                                onclick="removeProduct(${product.id})"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                </div>

                `
            )
            .join("");

}


window.editProduct =
    async function(id) {

        const product =
            await getProduct(id);


        if (!product)
            return;


        const name =
            prompt(
                "Product name:",
                product.name
            );


        if (name === null)
            return;


        const category =
            prompt(
                "Category:",
                product.category
            );


        if (category === null)
            return;


        const unit =
            prompt(
                "Unit:",
                product.unit
            );


        if (unit === null)
            return;


        const price =
            prompt(
                "Default price:",
                product.price
            );


        if (price === null)
            return;


        product.name =
            name.trim();


        product.category =
            category.trim();


        product.unit =
            unit.trim();


        product.price =
            Number(price) || 0;


        await updateProduct(
            product
        );


        await refreshAll();


        showToast(
            "Product updated."
        );

    };


window.removeProduct =
    async function(id) {

        const product =
            products.find(
                p =>
                    p.id === id
            );


        if (!product)
            return;


        if (
            !confirm(
                `Delete ${product.name}?`
            )
        ) {

            return;

        }


        await deleteProduct(id);


        await refreshAll();


        showToast(
            "Product deleted."
        );

    };


function populateProductSelect() {

    const select =
        document.getElementById(
            "purchaseProduct"
        );


    const oldValue =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Select product
        </option>
        `;


    const sorted =
        [...products].sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


    sorted.forEach(
        product => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                product.name;


            select.appendChild(
                option
            );

        }
    );


    if (
        products.some(
            p =>
                String(p.id) ===
                String(oldValue)
        )
    ) {

        select.value =
            oldValue;

    }

}


/* =====================================================
   PURCHASE
===================================================== */

function productSelected() {

    const productId =
        Number(
            document
                .getElementById(
                    "purchaseProduct"
                )
                .value
        );


    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product)
        return;


    document
        .getElementById(
            "purchaseUnit"
        )
        .value =
        product.unit || "";


    document
        .getElementById(
            "purchasePrice"
        )
        .value =
        product.price || "";


    calculatePurchaseTotal();

}


function calculatePurchaseTotal() {

    const quantity =
        Number(
            document
                .getElementById(
                    "purchaseQuantity"
                )
                .value ||
                0
        );


    const price =
        Number(
            document
                .getElementById(
                    "purchasePrice"
                )
                .value ||
                0
        );


    document
        .getElementById(
            "purchaseTotal"
        )
        .value =
        (
            quantity *
            price
        ).toFixed(2);

}


async function savePurchase(event) {

    event.preventDefault();


    const date =
        document
            .getElementById(
                "purchaseDate"
            )
            .value;


    const productId =
        Number(
            document
                .getElementById(
                    "purchaseProduct"
                )
                .value
        );


    const quantity =
        Number(
            document
                .getElementById(
                    "purchaseQuantity"
                )
                .value
        );


    const unit =
        document
            .getElementById(
                "purchaseUnit"
            )
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById(
                    "purchasePrice"
                )
                .value
        );


    const member =
        document
            .getElementById(
                "purchaseMember"
            )
            .value
            .trim();


    const note =
        document
            .getElementById(
                "purchaseNote"
            )
            .value
            .trim();


    if (
        !date ||
        !productId ||
        quantity <= 0
    ) {

        showToast(
            "Please fill the required fields."
        );

        return;

    }


    const product =
        products.find(
            p =>
                p.id === productId
        );


    if (!product) {

        showToast(
            "Product not found."
        );

        return;

    }


    const purchase = {

        date,

        productId,

        productName:
            product.name,

        category:
            product.category,

        quantity,

        unit,

        price,

        total:
            quantity * price,

        member,

        note,

        createdAt:
            new Date().toISOString()

    };


    if (
        editingPurchaseId
    ) {

        purchase.id =
            editingPurchaseId;


        await updatePurchase(
            purchase
        );


        editingPurchaseId =
            null;


        showToast(
            "Purchase updated."
        );

    } else {

        await addPurchase(
            purchase
        );


        showToast(
            "Purchase saved."
        );

    }


    clearPurchaseForm();


    await refreshAll();


    showPage(
        "dashboard"
    );

}


function clearPurchaseForm() {

    editingPurchaseId =
        null;


    document
        .getElementById(
            "purchaseForm"
        )
        .reset();


    document
        .getElementById(
            "purchaseDate"
        )
        .value =
        todayString();


    document
        .getElementById(
            "purchaseTotal"
        )
        .value =
        "";

}


window.clearPurchaseForm =
    clearPurchaseForm;


/* =====================================================
   RECENT PURCHASES
===================================================== */

function renderRecentPurchases() {

    const container =
        document.getElementById(
            "recentPurchases"
        );


    const list =
        [...purchases]
            .sort(
                (a, b) =>
                    b.id - a.id
            )
            .slice(
                0,
                10
            );


    if (
        list.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No purchases yet.
                <br><br>
                Add your first purchase.
            </div>
            `;

        return;

    }


    container.innerHTML =
        list
            .map(
                p => purchaseRowHTML(
                    p
                )
            )
            .join("");

}


/* =====================================================
   HISTORY
===================================================== */

function renderHistory() {

    const container =
        document.getElementById(
            "purchaseHistory"
        );


    const selectedDate =
        document.getElementById(
            "historyDate"
        ).value;


    const search =
        document
            .getElementById(
                "historySearch"
            )
            .value
            .trim()
            .toLowerCase();


    let list =
        [...purchases];


    if (selectedDate) {

        list =
            list.filter(
                p =>
                    p.date ===
                    selectedDate
            );

    }


    if (search) {

        list =
            list.filter(
                p =>

                    p.productName
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        p.category ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        p.member ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        p.note ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

            );

    }


    list.sort(
        (a, b) =>
            b.id - a.id
    );


    const total =
        list.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.total || 0
                ),
            0
        );


    document
        .getElementById(
            "historySummary"
        )
        .textContent =
        `${list.length} purchase(s) • Total ${money(total)}`;


    if (
        list.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">

                🔍

                <br><br>

                No purchases found.

            </div>
            `;

        return;

    }


    container.innerHTML =
        list
            .map(
                p =>
                    purchaseRowHTML(
                        p
                    )
            )
            .join("");

}


function purchaseRowHTML(purchase) {

    return `

        <div class="purchase-row">

            <div class="row-main">

                <div>

                    <div class="row-title">

                        🛒
                        ${escapeHTML(
                            purchase.productName
                        )}

                        —
                        ${money(
                            purchase.total
                        )}

                    </div>


                    <div class="row-details">

                        📅
                        ${formatDate(
                            purchase.date
                        )}

                        •
                        ${purchase.quantity}
                        ${escapeHTML(
                            purchase.unit ||
                            ""
                        )}

                        ×
                        ${money(
                            purchase.price
                        )}

                        ${
                            purchase.member
                                ? ` • 👤 ${escapeHTML(
                                    purchase.member
                                )}`
                                : ""
                        }

                        ${
                            purchase.note
                                ? ` • 📝 ${escapeHTML(
                                    purchase.note
                                )}`
                                : ""
                        }

                    </div>

                </div>


                <div class="row-actions">

                    <button
                        class="small-btn edit-btn"
                        onclick="editPurchase(${purchase.id})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="removePurchase(${purchase.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>

        </div>

    `;

}


window.editPurchase =
    async function(id) {

        const purchase =
            purchases.find(
                p =>
                    p.id === id
            );


        if (!purchase)
            return;


        editingPurchaseId =
            id;


        document
            .getElementById(
                "purchaseDate"
            )
            .value =
            purchase.date;


        document
            .getElementById(
                "purchaseProduct"
            )
            .value =
            purchase.productId;


        document
            .getElementById(
                "purchaseQuantity"
            )
            .value =
            purchase.quantity;


        document
            .getElementById(
                "purchaseUnit"
            )
            .value =
            purchase.unit;


        document
            .getElementById(
                "purchasePrice"
            )
            .value =
            purchase.price;


        document
            .getElementById(
                "purchaseMember"
            )
            .value =
            purchase.member ||
            "";


        document
            .getElementById(
                "purchaseNote"
            )
            .value =
            purchase.note ||
            "";


        calculatePurchaseTotal();


        showPage(
            "purchases"
        );


        window.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        );

    };


window.removePurchase =
    async function(id) {

        const purchase =
            purchases.find(
                p =>
                    p.id === id
            );


        if (!purchase)
            return;


        if (
            !confirm(
                `Delete ${purchase.productName} purchase?`
            )
        ) {

            return;

        }


        await deletePurchase(
            id
        );


        await refreshAll();


        showToast(
            "Purchase deleted."
        );

    };


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    const today =
        todayString();


    const todayPurchases =
        purchases.filter(
            p =>
                p.date ===
                today
        );


    const todayTotal =
        todayPurchases.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.total || 0
                ),
            0
        );


    const month =
        monthString();


    const monthPurchases =
        purchases.filter(
            p =>
                p.date.startsWith(
                    month
                )
        );


    const monthTotal =
        monthPurchases.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.total || 0
                ),
            0
        );


    document
        .getElementById(
            "todayTotal"
        )
        .textContent =
        money(todayTotal);


    document
        .getElementById(
            "monthTotal"
        )
        .textContent =
        money(monthTotal);


    document
        .getElementById(
            "todayItems"
        )
        .textContent =
        todayPurchases.length;


    document
        .getElementById(
            "productCount"
        )
        .textContent =
        products.length;


    const container =
        document.getElementById(
            "todayPurchaseList"
        );


    if (
        todayPurchases.length ===
        0
    ) {

        container.innerHTML =
            `
            <div class="empty">

                🛒

                <br><br>

                Nothing recorded today.

                <br><br>

                <button
                    class="primary"
                    onclick="showPage('purchases')"
                >
                    ＋ Add Purchase
                </button>

            </div>
            `;

        return;

    }


    container.innerHTML =
        todayPurchases
            .sort(
                (a, b) =>
                    b.id - a.id
            )
            .map(
                p =>
                    purchaseRowHTML(
                        p
                    )
            )
            .join("");

}


/* =====================================================
   REPORTS
===================================================== */

function renderReports() {

    const month =
        document
            .getElementById(
                "reportMonth"
            )
            .value;


    if (!month)
        return;


    const list =
        purchases.filter(
            p =>
                p.date.startsWith(
                    month
                )
        );


    const total =
        list.reduce(
            (sum, p) =>
                sum +
                Number(
                    p.total || 0
                ),
            0
        );


    document
        .getElementById(
            "reportTotal"
        )
        .textContent =
        money(total);


    renderCategoryReport(
        list
    );


    renderProductReport(
        list
    );


    renderMemberReport(
        list
    );

}


function renderCategoryReport(list) {

    const container =
        document.getElementById(
            "categoryReport"
        );


    const data = {};


    list.forEach(
        p => {

            const category =
                p.category ||
                "Other";


            if (!data[category]) {

                data[category] =
                    0;

            }


            data[category] +=
                Number(
                    p.total || 0
                );

        }
    );


    const entries =
        Object.entries(
            data
        ).sort(
            (a, b) =>
                b[1] -
                a[1]
        );


    if (
        entries.length ===
        0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No data for this month.
            </div>
            `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([category, total]) => `

                <div class="report-row">

                    <span>
                        ${escapeHTML(
                            category
                        )}
                    </span>

                    <strong>
                        ${money(total)}
                    </strong>

                </div>

                `
            )
            .join("");

}


function renderProductReport(list) {

    const container =
        document.getElementById(
            "productReport"
        );


    const data = {};


    list.forEach(
        p => {

            const name =
                p.productName ||
                "Unknown";


            if (!data[name]) {

                data[name] = {

                    quantity:
                        0,

                    unit:
                        p.unit ||
                        "",

                    total:
                        0

                };

            }


            data[name].quantity +=
                Number(
                    p.quantity || 0
                );


            data[name].total +=
                Number(
                    p.total || 0
                );

        }
    );


    const entries =
        Object.entries(
            data
        ).sort(
            (a, b) =>
                b[1].total -
                a[1].total
        );


    if (
        entries.length ===
        0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No data for this month.
            </div>
            `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([name, data]) => `

                <div class="report-row">

                    <div>

                        <strong>
                            ${escapeHTML(
                                name
                            )}
                        </strong>

                        <div class="row-details">

                            Quantity:
                            ${data.quantity}
                            ${escapeHTML(
                                data.unit
                            )}

                        </div>

                    </div>

                    <strong>
                        ${money(
                            data.total
                        )}
                    </strong>

                </div>

                `
            )
            .join("");

}


function renderMemberReport(list) {

    const container =
        document.getElementById(
            "memberReport"
        );


    const data = {};


    list.forEach(
        p => {

            const member =
                p.member ||
                "Not specified";


            if (!data[member]) {

                data[member] =
                    0;

            }


            data[member] +=
                Number(
                    p.total || 0
                );

        }
    );


    const entries =
        Object.entries(
            data
        ).sort(
            (a, b) =>
                b[1] -
                a[1]
        );


    if (
        entries.length ===
        0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No member information.
            </div>
            `;

        return;

    }


    container.innerHTML =
        entries
            .map(
                ([member, total]) => `

                <div class="report-row">

                    <span>
                        👤
                        ${escapeHTML(
                            member
                        )}
                    </span>

                    <strong>
                        ${money(total)}
                    </strong>

                </div>

                `
            )
            .join("");

}


/* =====================================================
   BACKUP
===================================================== */

async function backupData() {

    const data =
        await exportDatabase();


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `Family-Home-Backup-${todayString()}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Backup downloaded."
    );

}


window.backupData =
    backupData;


async function restoreData() {

    const input =
        document.getElementById(
            "restoreFile"
        );


    if (
        !input.files.length
    ) {

        showToast(
            "Please select a backup file."
        );

        return;

    }


    if (
        !confirm(
            "Restore this backup? Existing data will be replaced."
        )
    ) {

        return;

    }


    try {

        const file =
            input.files[0];


        const text =
            await file.text();


        const data =
            JSON.parse(
                text
            );


        if (
            !Array.isArray(
                data.products
            ) ||
            !Array.isArray(
                data.purchases
            )
        ) {

            throw new Error(
                "Invalid backup"
            );

        }


        await importDatabase(
            data
        );


        await refreshAll();


        showToast(
            "Backup restored successfully."
        );

    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Invalid backup file."
        );

    }

}


window.restoreData =
    restoreData;


async function deleteAllData() {

    if (
        !confirm(
            "Delete ALL household data from this device?"
        )
    ) {

        return;

    }


    if (
        !confirm(
            "Are you absolutely sure?"
        )
    ) {

        return;

    }


    await clearDatabase();


    await refreshAll();


    showToast(
        "All data deleted."
    );

}


/* =====================================================
   DAILY BILL IMAGE
===================================================== */

function getDailyBillData() {

    const date =
        document
            .getElementById(
                "historyDate"
            )
            .value;


    if (!date) {

        showToast(
            "Please select a date."
        );

        return null;

    }


    const list =
        purchases.filter(
            p =>
                p.date ===
                date
        );


    if (
        list.length ===
        0
    ) {

        showToast(
            "No purchases for this date."
        );

        return null;

    }


    return {
        date,
        purchases:
            list
    };

}


function createDailyBillCanvas() {

    const bill =
        getDailyBillData();


    if (!bill)
        return null;


    const width =
        1000;


    const rowHeight =
        75;


    const headerHeight =
        230;


    const footerHeight =
        180;


    const height =
        headerHeight +
        bill.purchases.length *
        rowHeight +
        footerHeight;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;


    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /* Background */

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* Header */

    ctx.fillStyle =
        "#2563eb";


    ctx.fillRect(
        0,
        0,
        width,
        headerHeight
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 46px Arial";


    ctx.fillText(
        "HOUSEHOLD BILL",
        45,
        70
    );


    ctx.font =
        "30px Arial";


    ctx.fillText(
        formatDate(
            bill.date
        ),
        45,
        125
    );


    ctx.font =
        "20px Arial";


    ctx.fillText(
        "Family Home Manager",
        45,
        175
    );


    let y =
        headerHeight;


    /* Table heading */

    ctx.fillStyle =
        "#eff6ff";


    ctx.fillRect(
        0,
        y,
        width,
        rowHeight
    );


    ctx.fillStyle =
        "#111827";


    ctx.font =
        "bold 23px Arial";


    ctx.fillText(
        "Product",
        40,
        y + 47
    );


    ctx.fillText(
        "Quantity",
        430,
        y + 47
    );


    ctx.fillText(
        "Price",
        640,
        y + 47
    );


    ctx.fillText(
        "Total",
        820,
        y + 47
    );


    y +=
        rowHeight;


    let grandTotal =
        0;


    bill.purchases.forEach(
        (purchase, index) => {

            if (
                index % 2 ===
                1
            ) {

                ctx.fillStyle =
                    "#f9fafb";


                ctx.fillRect(
                    0,
                    y,
                    width,
                    rowHeight
                );

            }


            ctx.fillStyle =
                "#111827";


            ctx.font =
                "21px Arial";


            ctx.fillText(
                truncateText(
                    purchase.productName,
                    30
                ),
                40,
                y + 47
            );


            ctx.fillText(
                `${purchase.quantity} ${
                    purchase.unit || ""
                }`,
                430,
                y + 47
            );


            ctx.fillText(
                money(
                    purchase.price
                ),
                640,
                y + 47
            );


            ctx.fillText(
                money(
                    purchase.total
                ),
                820,
                y + 47
            );


            grandTotal +=
                Number(
                    purchase.total ||
                    0
                );


            y +=
                rowHeight;

        }
    );


    /* Total */

    y +=
        30;


    ctx.fillStyle =
        "#111827";


    ctx.font =
        "bold 32px Arial";


    ctx.fillText(
        "TOTAL",
        650,
        y + 50
    );


    ctx.fillStyle =
        "#2563eb";


    ctx.font =
        "bold 36px Arial";


    ctx.fillText(
        money(
            grandTotal
        ),
        820,
        y + 50
    );


    ctx.fillStyle =
        "#6b7280";


    ctx.font =
        "18px Arial";


    ctx.fillText(
        "Generated by Family Home Manager",
        40,
        height - 40
    );


    return canvas;

}


/* =====================================================
   MONTHLY BILL IMAGE
===================================================== */

function getMonthlyBillData() {

    const month =
        document
            .getElementById(
                "reportMonth"
            )
            .value;


    if (!month) {

        showToast(
            "Please select a month."
        );

        return null;

    }


    const list =
        purchases.filter(
            p =>
                p.date.startsWith(
                    month
                )
        );


    if (
        list.length ===
        0
    ) {

        showToast(
            "No purchases for this month."
        );

        return null;

    }


    const data = {};


    list.forEach(
        purchase => {

            const name =
                purchase.productName;


            if (!data[name]) {

                data[name] = {

                    quantity:
                        0,

                    unit:
                        purchase.unit ||
                        "",

                    total:
                        0

                };

            }


            data[name].quantity +=
                Number(
                    purchase.quantity ||
                    0
                );


            data[name].total +=
                Number(
                    purchase.total ||
                    0
                );

        }
    );


    return {

        month,

        monthName:
            getMonthName(
                month
            ),

        products:
            Object.entries(
                data
            )

    };

}


function createMonthlyBillCanvas() {

    const bill =
        getMonthlyBillData();


    if (!bill)
        return null;


    const width =
        1000;


    const rowHeight =
        75;


    const headerHeight =
        230;


    const footerHeight =
        180;


    const height =
        headerHeight +
        bill.products.length *
        rowHeight +
        footerHeight;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;


    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* Header */

    ctx.fillStyle =
        "#16a34a";


    ctx.fillRect(
        0,
        0,
        width,
        headerHeight
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 43px Arial";


    ctx.fillText(
        "MONTHLY HOUSEHOLD BILL",
        40,
        70
    );


    ctx.font =
        "32px Arial";


    ctx.fillText(
        bill.monthName,
        40,
        125
    );


    ctx.font =
        "20px Arial";


    ctx.fillText(
        "Family Home Manager",
        40,
        175
    );


    let y =
        headerHeight;


    /* Header */

    ctx.fillStyle =
        "#f0fdf4";


    ctx.fillRect(
        0,
        y,
        width,
        rowHeight
    );


    ctx.fillStyle =
        "#111827";


    ctx.font =
        "bold 23px Arial";


    ctx.fillText(
        "Product",
        40,
        y + 47
    );


    ctx.fillText(
        "Quantity",
        500,
        y + 47
    );


    ctx.fillText(
        "Total",
        820,
        y + 47
    );


    y +=
        rowHeight;


    let grandTotal =
        0;


    bill.products.forEach(
        ([name, data], index) => {

            if (
                index % 2 ===
                1
            ) {

                ctx.fillStyle =
                    "#f9fafb";


                ctx.fillRect(
                    0,
                    y,
                    width,
                    rowHeight
                );

            }


            ctx.fillStyle =
                "#111827";


            ctx.font =
                "21px Arial";


            ctx.fillText(
                truncateText(
                    name,
                    38
                ),
                40,
                y + 47
            );


            ctx.fillText(
                `${formatQuantity(
                    data.quantity
                )} ${
                    data.unit
                }`,
                500,
                y + 47
            );


            ctx.fillText(
                money(
                    data.total
                ),
                820,
                y + 47
            );


            grandTotal +=
                Number(
                    data.total ||
                    0
                );


            y +=
                rowHeight;

        }
    );


    y +=
        30;


    ctx.fillStyle =
        "#111827";


    ctx.font =
        "bold 31px Arial";


    ctx.fillText(
        "MONTHLY TOTAL",
        520,
        y + 50
    );


    ctx.fillStyle =
        "#16a34a";


    ctx.font =
        "bold 36px Arial";


    ctx.fillText(
        money(
            grandTotal
        ),
        820,
        y + 50
    );


    ctx.fillStyle =
        "#6b7280";


    ctx.font =
        "18px Arial";


    ctx.fillText(
        "Generated by Family Home Manager",
        40,
        height - 40
    );


    return canvas;

}


/* =====================================================
   BILL HELPERS
===================================================== */

function formatQuantity(value) {

    return Number(
        value
    ).toLocaleString(
        "en-US",
        {
            maximumFractionDigits:
                2
        }
    );

}


function truncateText(
    text,
    maxLength
) {

    text =
        String(
            text || ""
        );


    if (
        text.length <=
        maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength - 3
        ) +
        "..."
    );

}


/* =====================================================
   DOWNLOAD DAILY BILL
===================================================== */

window.downloadBillImage =
    function() {

        const canvas =
            createDailyBillCanvas();


        if (!canvas)
            return;


        canvas.toBlob(
            blob => {

                const url =
                    URL.createObjectURL(
                        blob
                    );


                const date =
                    document
                        .getElementById(
                            "historyDate"
                        )
                        .value;


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    `Household-Bill-${date}.png`;


                document.body.appendChild(
                    link
                );


                link.click();


                document.body.removeChild(
                    link
                );


                URL.revokeObjectURL(
                    url
                );


                showToast(
                    "Daily bill image downloaded."
                );

            },
            "image/png"
        );

    };


/* =====================================================
   SHARE DAILY BILL
===================================================== */

window.shareBillImage =
    async function() {

        const canvas =
            createDailyBillCanvas();


        if (!canvas)
            return;


        canvas.toBlob(
            async blob => {

                const date =
                    document
                        .getElementById(
                            "historyDate"
                        )
                        .value;


                const file =
                    new File(
                        [blob],
                        `Household-Bill-${date}.png`,
                        {
                            type:
                                "image/png"
                        }
                    );


                if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare(
                        {
                            files:
                                [file]
                        }
                    )
                ) {

                    try {

                        await navigator.share(
                            {
                                title:
                                    "Household Bill",

                                text:
                                    `Household Bill - ${formatDate(date)}`,

                                files:
                                    [file]
                            }
                        );

                    }
                    catch (
                        error
                    ) {

                        console.log(
                            "Share cancelled."
                        );

                    }

                }
                else {

                    showToast(
                        "Sharing is not supported here. Download the image instead."
                    );

                }

            },
            "image/png"
        );

    };


/* =====================================================
   DOWNLOAD MONTHLY BILL
===================================================== */

window.downloadMonthlyBillImage =
    function() {

        const canvas =
            createMonthlyBillCanvas();


        if (!canvas)
            return;


        canvas.toBlob(
            blob => {

                const month =
                    document
                        .getElementById(
                            "reportMonth"
                        )
                        .value;


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    `Household-Monthly-Bill-${month}.png`;


                document.body.appendChild(
                    link
                );


                link.click();


                document.body.removeChild(
                    link
                );


                URL.revokeObjectURL(
                    url
                );


                showToast(
                    "Monthly bill image downloaded."
                );

            },
            "image/png"
        );

    };


/* =====================================================
   SHARE MONTHLY BILL
===================================================== */

window.shareMonthlyBillImage =
    async function() {

        const canvas =
            createMonthlyBillCanvas();


        if (!canvas)
            return;


        canvas.toBlob(
            async blob => {

                const month =
                    document
                        .getElementById(
                            "reportMonth"
                        )
                        .value;


                const file =
                    new File(
                        [blob],
                        `Household-Monthly-Bill-${month}.png`,
                        {
                            type:
                                "image/png"
                        }
                    );


                if (
                    navigator.share &&
                    navigator.canShare &&
                    navigator.canShare(
                        {
                            files:
                                [file]
                        }
                    )
                ) {

                    try {

                        await navigator.share(
                            {
                                title:
                                    "Monthly Household Bill",

                                text:
                                    `Monthly Household Bill - ${getMonthName(month)}`,

                                files:
                                    [file]
                            }
                        );

                    }
                    catch (
                        error
                    ) {

                        console.log(
                            "Share cancelled."
                        );

                    }

                }
                else {

                    showToast(
                        "Sharing is not supported here. Download the image instead."
                    );

                }

            },
            "image/png"
        );

    };


/* =====================================================
   PWA INSTALL
===================================================== */

let deferredPrompt =
    null;


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredPrompt =
            event;


        document
            .getElementById(
                "installBtn"
            )
            .classList.remove(
                "hidden"
            );

    }
);


document
    .getElementById(
        "installBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                !deferredPrompt
            )
                return;


            deferredPrompt.prompt();


            await deferredPrompt
                .userChoice;


            deferredPrompt =
                null;


            document
                .getElementById(
                    "installBtn"
                )
                .classList.add(
                    "hidden"
                );

        }
    );