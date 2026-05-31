import os
import re

# --- CONFIGURACIÓN ---
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

CSS_FILE = os.path.join(PROJECT_DIR, "style.css")
CSS_MIN_FILE = os.path.join(PROJECT_DIR, "style.min.css")

# Orden de consolidación de JS (Lógica de dependencias)
JS_FILES = [
    os.path.join(PROJECT_DIR, "catalog-service.js"),
    os.path.join(PROJECT_DIR, "cart-service.js"),
    os.path.join(PROJECT_DIR, "ui-controller.js"),
    os.path.join(PROJECT_DIR, "app.js")
]
JS_MIN_FILE = os.path.join(PROJECT_DIR, "app.min.js")

def minify_css(input_path, output_path):
    """
    Minifica un archivo CSS removiendo comentarios, espacios en blanco extras y saltos de línea.
    """
    if not os.path.exists(input_path):
        print(f"Error: {input_path} no existe.")
        return
        
    print(f"Comprimiendo CSS: {os.path.basename(input_path)}...")
    with open(input_path, "r", encoding="utf-8", errors="replace") as f:
        css = f.read()

    # 1. Remover comentarios de bloque (/* ... */)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    
    # 2. Remover espacios alrededor de llaves, puntos y comas
    css = re.sub(r'\s*([\{\}:;,])\s*', r'\1', css)
    
    # 3. Remover saltos de línea y tabulaciones redundantes
    css = re.sub(r'\s+', ' ', css)
    
    # 4. Eliminar espacios innecesarios
    css = css.strip()

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(css)
        
    orig_size = os.path.getsize(input_path) / 1024
    min_size = os.path.getsize(output_path) / 1024
    savings = (1 - (min_size / orig_size)) * 100
    print(f"  [OK] Completado: {orig_size:.1f} KB -> {min_size:.1f} KB ({savings:.1f}% ahorrado)")

def minify_js(input_paths, output_path):
    """
    Consolida múltiples archivos JS en orden y comprime su contenido
    eliminando comentarios y espacios innecesarios con absoluta seguridad.
    """
    consolidated_js = ""
    total_original_size = 0
    
    print("Consolidando archivos JavaScript...")
    for path in input_paths:
        if not os.path.exists(path):
            print(f"  [AVISO] Advertencia: {os.path.basename(path)} no existe, omitiendo.")
            continue
            
        print(f"  + Agregando {os.path.basename(path)}...")
        total_original_size += os.path.getsize(path)
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            consolidated_js += f.read() + "\n"

    print("Comprimiendo JavaScript...")
    
    # 1. Remover comentarios de bloque (/* ... */)
    js = re.sub(r'/\*.*?\*/', '', consolidated_js, flags=re.DOTALL)
    
    # 2. Remover comentarios de línea (// ...) de forma segura
    # Buscamos comentarios de línea que no estén dentro de strings (comillas simples o dobles)
    def line_comment_remover(match):
        s = match.group(0)
        if s.startswith('/') or s.startswith('#'):
            return ""
        else:
            return s
            
    # Patrón para identificar strings, plantillas y comentarios de línea
    pattern = re.compile(
        r'//.*?$|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`',
        re.MULTILINE
    )
    js = re.sub(pattern, line_comment_remover, js)
    
    # 3. Limpiar espacios en blanco de forma segura por líneas
    cleaned_lines = []
    for line in js.splitlines():
        trimmed = line.strip()
        if trimmed:
            cleaned_lines.append(trimmed)
            
    # 4. Volver a unir usando saltos de línea estándar (mantiene seguridad de punto y coma)
    js = "\n".join(cleaned_lines)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js)
        
    orig_kb = total_original_size / 1024
    min_kb = os.path.getsize(output_path) / 1024
    savings = (1 - (min_kb / orig_kb)) * 100
    print(f"  [OK] Completado: {orig_kb:.1f} KB -> {min_kb:.1f} KB ({savings:.1f}% ahorrado)")

if __name__ == "__main__":
    print("=== INICIANDO COMPILADOR DE PRODUCCION (UNIVERCELU) ===")
    minify_css(CSS_FILE, CSS_MIN_FILE)
    minify_js(JS_FILES, JS_MIN_FILE)
    print("=== PROCESO TERMINADO CON EXITO ===")
