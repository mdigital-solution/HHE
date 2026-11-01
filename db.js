const DB_NAME = "FamilyHomeManagerDB";

const DB_VERSION = 1;

let db;


/* =====================================================
   OPEN DATABASE
===================================================== */

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function(event) {

                    db =
                        event.target.result;


                    if (
                        !db.objectStoreNames
                            .contains("products")
                    ) {

                        const products =
                            db.createObjectStore(
                                "products",
                                {
                                    keyPath: "id",
                                    autoIncrement: true
                                }
                            );


                        products.createIndex(
                            "name",
                            "name",
                            {
                                unique: false
                            }
                        );

                    }


                    if (
                        !db.objectStoreNames
                            .contains("purchases")
                    ) {

                        const purchases =
                            db.createObjectStore(
                                "purchases",
                                {
                                    keyPath: "id",
                                    autoIncrement: true
                                }
                            );


                        purchases.createIndex(
                            "date",
                            "date",
                            {
                                unique: false
                            }
                        );


                        purchases.createIndex(
                            "productId",
                            "productId",
                            {
                                unique: false
                            }
                        );

                    }

                };


            request.onsuccess =
                function(event) {

                    db =
                        event.target.result;

                    resolve(db);

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =====================================================
   PRODUCTS
===================================================== */

function addProduct(product) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("products")
                    .add(product);


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function getProducts() {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readonly"
                );


            const request =
                transaction
                    .objectStore("products")
                    .getAll();


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function getProduct(id) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readonly"
                );


            const request =
                transaction
                    .objectStore("products")
                    .get(
                        Number(id)
                    );


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function updateProduct(product) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("products")
                    .put(product);


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function deleteProduct(id) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("products")
                    .delete(
                        Number(id)
                    );


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


/* =====================================================
   PURCHASES
===================================================== */

function addPurchase(purchase) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["purchases"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("purchases")
                    .add(purchase);


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function getPurchases() {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["purchases"],
                    "readonly"
                );


            const request =
                transaction
                    .objectStore("purchases")
                    .getAll();


            request.onsuccess =
                () => resolve(
                    request.result
                );


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function updatePurchase(purchase) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["purchases"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("purchases")
                    .put(purchase);


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function deletePurchase(id) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["purchases"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("purchases")
                    .delete(
                        Number(id)
                    );


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


/* =====================================================
   CLEAR DATABASE
===================================================== */

function clearDatabase() {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    [
                        "products",
                        "purchases"
                    ],
                    "readwrite"
                );


            transaction
                .objectStore("products")
                .clear();


            transaction
                .objectStore("purchases")
                .clear();


            transaction.oncomplete =
                () => resolve();


            transaction.onerror =
                () => reject(
                    transaction.error
                );

        }
    );

}


/* =====================================================
   BACKUP
===================================================== */

async function exportDatabase() {

    const products =
        await getProducts();


    const purchases =
        await getPurchases();


    return {

        app:
            "Family Home Manager",

        version:
            1,

        exportedAt:
            new Date().toISOString(),

        products,

        purchases

    };

}


/* =====================================================
   RESTORE
===================================================== */

function addImportedProduct(product) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["products"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("products")
                    .put(product);


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


function addImportedPurchase(purchase) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    ["purchases"],
                    "readwrite"
                );


            const request =
                transaction
                    .objectStore("purchases")
                    .put(purchase);


            request.onsuccess =
                () => resolve();


            request.onerror =
                () => reject(
                    request.error
                );

        }
    );

}


async function importDatabase(data) {

    await clearDatabase();


    for (
        const product
        of (data.products || [])
    ) {

        await addImportedProduct(
            product
        );

    }


    for (
        const purchase
        of (data.purchases || [])
    ) {

        await addImportedPurchase(
            purchase
        );

    }

}