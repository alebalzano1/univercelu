// Firebase & Cloudinary Service for UNIVERCE CELU
// Sincronización robusta en tiempo real con soporte de persistencia local (Sandbox)

let db = null;
let isFirebaseActive = false;

// Inicializar Firebase si las credenciales son válidas
try {
    const config = window.firebaseConfig;
    if (config && config.apiKey && config.apiKey !== "[PEGAR VALOR REAL]" && config.apiKey !== "") {
        firebase.initializeApp(config);
        db = firebase.firestore();
        isFirebaseActive = true;
        console.log("🔥 [Firebase] Conexión establecida con éxito en la nube de Universe Celu.");
    } else {
        console.warn("⚠️ [Firebase] Corriendo en modo Local / Sandbox (LocalStorage). Configura las credenciales reales en firebase-config.js para conectar la base de datos en la nube.");
    }
} catch (error) {
    console.error("❌ [Firebase] Error al inicializar Firebase:", error);
}

const FirebaseService = {
    // --- Diagnóstico de Conexión ---
    isCloudActive() {
        return isFirebaseActive;
    },

    // --- GESTIÓN DE CREDENCIALES PERSONALIZADAS ---
    async getCustomCredentials() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("univercelu_custom_credentials");
            return local ? JSON.parse(local) : { username: "univercelu1", password: "admin123" };
        }
        try {
            const doc = await db.collection("settings").doc("credentials").get();
            if (doc.exists) {
                return doc.data();
            } else {
                return { username: "univercelu1", password: "admin123" };
            }
        } catch (error) {
            console.warn("⚠️ [Firebase] Fallo al leer credenciales de Firestore, usando defaults:", error);
            return { username: "univercelu1", password: "admin123" };
        }
    },

    async saveCustomCredentials(username, password) {
        const creds = { username, password };
        if (!isFirebaseActive) {
            localStorage.setItem("univercelu_custom_credentials", JSON.stringify(creds));
            return;
        }
        try {
            await db.collection("settings").doc("credentials").set(creds);
            console.log("🔑 [Firebase] Credenciales personalizadas guardadas con éxito en Firestore.");
        } catch (error) {
            console.error("❌ [Firebase] Error al guardar credenciales personalizadas:", error);
            throw error;
        }
    },

    // --- AUTENTICACIÓN ---
    async login(username, password) {
        const creds = await this.getCustomCredentials();
        const success = (username === creds.username && password === creds.password);

        if (!success) {
            return false;
        }

        if (isFirebaseActive) {
            try {
                const auth = firebase.auth();
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                try {
                    // Intento 1: Con la nueva contraseña secreta requerida
                    await auth.signInWithEmailAndPassword("admin@univercelu.com", "Univercelu2024!");
                } catch (firstError) {
                    console.warn("⚠️ [Firebase Silencioso] Error con contraseña 'Univercelu2024!', intentando fallback con 'admin123'...");
                    // Intento 2: Fallback con la contraseña técnica anterior
                    await auth.signInWithEmailAndPassword("admin@univercelu.com", "admin123");
                }
            } catch (error) {
                console.error("[Firebase Silencioso] Error en inicio técnico de sesión (ambos intentos fallaron):", error);
                throw new Error("Error de conexión de base de datos. Asegúrate de tener creado el usuario 'admin@univercelu.com' con contraseña 'Univercelu2024!' o 'admin123' en la pestaña Authentication de tu consola Firebase.");
            }
        } else {
            localStorage.setItem("univercelu_sandbox_logged", "true");
        }

        localStorage.setItem("univercelu_logged_username", username);
        return true;
    },

    async logout() {
        localStorage.removeItem("univercelu_sandbox_logged");
        localStorage.removeItem("univercelu_logged_username");
        if (!isFirebaseActive) return;
        try {
            console.log("[Firebase] Cerrando sesión técnica...");
            await firebase.auth().signOut();
        } catch (error) {
            console.error("[Firebase] Error en cierre de sesión:", error);
        }
    },

    onAuth(callback) {
        if (!isFirebaseActive) {
            const isLocalLogged = localStorage.getItem("univercelu_sandbox_logged") === "true";
            const customUsername = localStorage.getItem("univercelu_logged_username") || "univercelu1";
            callback(isLocalLogged ? { email: customUsername, uid: "sandbox" } : null);
            return;
        }
        firebase.auth().onAuthStateChanged((user) => {
            const customUsername = localStorage.getItem("univercelu_logged_username");
            if (user && customUsername) {
                callback({ email: customUsername, uid: user.uid });
            } else {
                callback(null);
            }
        });
    },

    // --- Autosiembra (Seeding) ---
    // Si la base de datos está vacía, se inicializa automáticamente con los valores por defecto
    async autoSeedDatabase(initialProducts, initialConfig) {
        if (!isFirebaseActive) return;
        try {
            const productSnapshot = await db.collection("products").limit(1).get();
            if (productSnapshot.empty) {
                console.log("🌱 [Firebase] Base de datos vacía. Iniciando autosiembra para Universe Celu...");

                // Sembrar Productos
                for (const p of initialProducts) {
                    await db.collection("products").doc(p.id).set(p);
                }

                // Sembrar Configuración
                await db.collection("settings").doc("main").set(initialConfig);

                console.log("🌱 [Firebase] Autosiembra completada con éxito.");
            }

            // Sembrar credenciales por defecto si no existen en Firestore
            const credsDoc = await db.collection("settings").doc("credentials").get();
            if (!credsDoc.exists) {
                console.log("🌱 [Firebase] Sembrando credenciales de administrador por defecto (univercelu1 / admin123)...");
                await db.collection("settings").doc("credentials").set({
                    username: "univercelu1",
                    password: "admin123"
                });
            }
        } catch (error) {
            console.error("❌ [Firebase] Error durante el proceso de autosiembra:", error);
        }
    },

    // --- Restablecer y Sembrar Base de Datos Forzado ---
    async forceResetAndSeedDatabase(initialProducts, initialConfig) {
        if (!isFirebaseActive) {
            // Local fallback logic
            localStorage.setItem("univercelu_products_v3", JSON.stringify(initialProducts));
            localStorage.setItem("univercelu_config", JSON.stringify(initialConfig));
            return;
        }
        try {
            console.log("⚠️ [Firebase] Iniciando limpieza total de productos...");
            const snapshot = await db.collection("products").get();
            for (const doc of snapshot.docs) {
                await db.collection("products").doc(doc.id).delete();
            }

            console.log("🌱 [Firebase] Escribiendo catálogo oficial limpio...");
            for (const p of initialProducts) {
                await db.collection("products").doc(p.id).set(p);
            }

            console.log("⚙️ [Firebase] Escribiendo configuraciones comerciales por defecto...");
            await db.collection("settings").doc("main").set(initialConfig);

            console.log("✨ [Firebase] Base de datos restablecida con éxito.");
        } catch (error) {
            console.error("❌ [Firebase] Error en restablecimiento forzado:", error);
            throw error;
        }
    },

    // --- PRODUCTOS ---
    async getProducts() {
        if (!isFirebaseActive) {
            // Modo local: Leer de localStorage
            const local = localStorage.getItem("univercelu_products_v3");
            return local ? JSON.parse(local) : null;
        }
        try {
            console.log("[Firebase] Obteniendo productos de Firestore...");
            const snapshot = await db.collection("products").get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("[Firebase] Error al obtener productos:", error);
            throw error;
        }
    },

    async saveProduct(product) {
        if (!isFirebaseActive) {
            // Guardar localmente
            let localProducts = await this.getProducts() || [];
            const index = localProducts.findIndex(p => p.id === product.id);
            if (index > -1) {
                localProducts[index] = product;
            } else {
                localProducts.push(product);
            }
            localStorage.setItem("univercelu_products_v3", JSON.stringify(localProducts));
            return;
        }
        try {
            const id = product.id;
            console.log("[Firebase] Guardando producto:", id);
            await db.collection("products").doc(id).set(product);
        } catch (error) {
            console.error("[Firebase] Error al guardar producto:", error);
            throw error;
        }
    },

    async deleteProduct(id) {
        if (!isFirebaseActive) {
            // Eliminar localmente
            let localProducts = await this.getProducts() || [];
            localProducts = localProducts.filter(p => p.id !== id);
            localStorage.setItem("univercelu_products_v3", JSON.stringify(localProducts));
            return;
        }
        try {
            console.log("[Firebase] Eliminando producto:", id);
            await db.collection("products").doc(id).delete();
        } catch (error) {
            console.error("[Firebase] Error al eliminar producto:", error);
            throw error;
        }
    },

    // --- CONFIGURACIÓN GENERAL ---
    async getConfig() {
        if (!isFirebaseActive) {
            const local = localStorage.getItem("univercelu_config");
            return local ? JSON.parse(local) : null;
        }
        try {
            console.log("[Firebase] Obteniendo configuraciones de Firestore...");
            const doc = await db.collection("settings").doc("main").get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error("[Firebase] Error al obtener configuración:", error);
            throw error;
        }
    },

    async saveConfig(configData) {
        if (!isFirebaseActive) {
            localStorage.setItem("univercelu_config", JSON.stringify(configData));
            return;
        }
        try {
            console.log("[Firebase] Guardando configuración general...");
            await db.collection("settings").doc("main").set(configData);
        } catch (error) {
            console.error("[Firebase] Error al guardar configuración:", error);
            throw error;
        }
    },

    // --- SUBIDA DE IMÁGENES A CLOUDINARY ---
    async uploadImage(file) {
        console.log("[Cloudinary] Iniciando subida a Cloudinary...");

        // Reutilizamos el bucket y preset para garantizar compatibilidad directa
        const cloudName = "dgb5o9y0v";
        const uploadPreset = "ugda3w5p";
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Error al subir la imagen");
            }

            const data = await response.json();
            console.log("[Cloudinary] Imagen subida exitosamente:", data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error("[Cloudinary] Error crítico al subir imagen:", error);
            throw error;
        }
    }
};

// Exportar para uso global
window.FirebaseService = FirebaseService;

// Auto-siembra reactiva: si la base de datos está vacía, carga los datos iniciales
document.addEventListener("DOMContentLoaded", () => {
    // Ejecución inicial en la carga del DOM
    FirebaseService.autoSeedDatabase(
        window.initialProducts,
        window.initialConfig
    );

    // Ejecución reactiva en cuanto se detecte la restauración de la sesión del administrador
    if (typeof firebase !== 'undefined' && isFirebaseActive) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log("🔑 [Firebase Auth] Administrador detectado. Verificando autosiembra...");
                FirebaseService.autoSeedDatabase(
                    window.initialProducts,
                    window.initialConfig
                );
            }
        });
    }
});
