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

    // --- AUTENTICACIÓN ---
    async login(email, password) {
        const auth = firebase.auth();
        return await auth.signInWithEmailAndPassword(email, password);
    },

    async changePassword(newPassword) {
        const user = firebase.auth().currentUser;
        if (user) {
            return await user.updatePassword(newPassword);
        } else {
            throw new Error("No hay un usuario autenticado activo.");
        }
    },

    async logout() {
        const auth = firebase.auth();
        return await auth.signOut();
    },

    onAuth(callback) {
        const auth = firebase.auth();
        auth.onAuthStateChanged((user) => {
            callback(user);
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

            // No se siembran credenciales en la base de datos por ser inseguro.
            // Los usuarios de administración se manejan directamente desde Firebase Auth Console.
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

    // --- SUBIDA DE IMÁGENES Y VIDEOS A CLOUDINARY ---
    async uploadImage(file) {
        console.log("[Cloudinary] Iniciando subida a Cloudinary...");

        // Reutilizamos el bucket y preset para garantizar compatibilidad directa
        const cloudName = "dgb5o9y0v";
        const uploadPreset = "ugda3w5p";
        
        // Detección automática de tipo de archivo para redirección a Cloudinary
        const isVideo = file.type && file.type.startsWith("video/");
        const resourceType = isVideo ? "video" : "image";
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

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
                throw new Error(errorData.error?.message || "Error al subir el archivo");
            }

            const data = await response.json();
            console.log("[Cloudinary] Archivo subido exitosamente:", data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error("[Cloudinary] Error crítico al subir archivo:", error);
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
                // TEMPORAL: Forzar resembrado una vez para corregir las imágenes desalineadas
                if (!localStorage.getItem("univercelu_db_fixed_v4")) {
                    console.log("🔄 [Reseed DB] Aplicando corrección de imágenes desalineadas en Firestore...");
                    FirebaseService.forceResetAndSeedDatabase(
                        window.initialProducts,
                        window.initialConfig
                    ).then(() => {
                        localStorage.setItem("univercelu_db_fixed_v4", "true");
                        console.log("✨ [Reseed DB] Base de datos corregida con éxito.");
                    }).catch(err => {
                        console.error("❌ [Reseed DB] Error al corregir base de datos:", err);
                    });
                } else {
                    FirebaseService.autoSeedDatabase(
                        window.initialProducts,
                        window.initialConfig
                    );
                }
            }
        });
    }
});
