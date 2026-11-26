import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Server {

    private static final int PORT = 3001;

    private static final String MODEL = "gemini-3.5-flash-lite";

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/"
                    + MODEL + ":generateContent";

    public static void main(String[] args) throws IOException {

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            System.out.println(
                    "ADVERTENCIA: No se detecto GEMINI_API_KEY."
            );
        }

        HttpServer server = HttpServer.create(
                new InetSocketAddress(PORT), 0
        );

        server.createContext(
                "/api/simplificar",
                exchange -> manejarPeticion(exchange, "simplificar")
        );

        server.createContext(
                "/api/ruta",
                exchange -> manejarPeticion(exchange, "ruta")
        );

        server.createContext(
                "/api/redactar",
                exchange -> manejarPeticion(exchange, "redactar")
        );

        server.setExecutor(null);

        System.out.println("Modelo Gemini utilizado: " + MODEL);

        server.start();

        System.out.println(
                "Servidor Java BecaLink activo en http://localhost:"
                        + PORT
        );
    }

    // MANEJO DE PETICIONES HTTP

    private static void manejarPeticion(
            HttpExchange exchange, String tipo
    ) throws IOException {

        // Configuracion CORS
        exchange.getResponseHeaders().add(
                "Access-Control-Allow-Origin", "*"
        );

        exchange.getResponseHeaders().add(
                "Access-Control-Allow-Methods", "POST, OPTIONS"
        );

        exchange.getResponseHeaders().add(
                "Access-Control-Allow-Headers", "Content-Type"
        );

        // Permitir solicitudes OPTIONS
        if ("OPTIONS".equalsIgnoreCase(
                exchange.getRequestMethod())) {

            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Verificar metodo POST
        if (!"POST".equalsIgnoreCase(
                exchange.getRequestMethod())) {

            enviarJson(
                    exchange,
                    405,
                    "{\"error\":\"Metodo no permitido. Usa POST.\"}"
            );

            return;
        }

        System.out.println("PETICION RECIBIDA: " + tipo);

        // Leer datos enviados desde React
        String body = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8
        );

        // Construir instrucciones para Gemini
        String prompt = construirPrompt(tipo, body);

        // Consultar Gemini
        String respuestaIA = llamarGemini(prompt);

        // Preparar respuesta JSON
        String jsonSalida =
                "{\"resultado\":\""
                        + escaparJson(respuestaIA)
                        + "\"}";

        enviarJson(exchange, 200, jsonSalida);
    }

    // CONSTRUCCION DE PROMPTS

    private static String construirPrompt(
            String tipo, String datosEntrada
    ) {

        return switch (tipo) {

            case "simplificar" ->
                    "Actua como un asistente amable para estudiantes "
                    + "de primera generacion. "
                    + "Explica en lenguaje sencillo, claro y sin "
                    + "tecnicismos la siguiente convocatoria "
                    + "(que ofrece, requisitos y fechas). "
                    + "Datos recibidos: " + datosEntrada;

            case "ruta" ->
                    "Crea una ruta paso a paso ordenada con documentos "
                    + "y fechas limite para postularse a esta beca "
                    + "segun el perfil del estudiante. "
                    + "Datos recibidos: " + datosEntrada;

            case "redactar" ->
                    "Ayuda al estudiante a estructurar un borrador "
                    + "claro, honesto y respetuoso para su carta "
                    + "de motivos o formulario socioeconomico "
                    + "a partir de estas ideas. "
                    + "Datos recibidos: " + datosEntrada;

            default ->
                    "Responde de forma clara y util: " + datosEntrada;
        };
    }

    // CONEXION CON GEMINI Y REINTENTOS AUTOMATICOS

    private static String llamarGemini(String prompt) {

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {

            return "Error: Configura la variable de entorno "
                    + "GEMINI_API_KEY antes de iniciar el servidor.";
        }

        try {

            // Crear contenido JSON
            String payload =
                    "{\"contents\":[{\"parts\":[{\"text\":\""
                            + escaparJson(prompt)
                            + "\"}]}]}";

            // Configurar cliente HTTP
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();

            // Realizar hasta 3 intentos
            for (int intento = 1; intento <= 3; intento++) {

                System.out.println(
                        "Conectando con Gemini. Intento: " + intento
                );

                // Construir peticion
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(
                                GEMINI_URL + "?key=" + apiKey
                        ))
                        .timeout(Duration.ofSeconds(45))
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .POST(
                                HttpRequest.BodyPublishers.ofString(payload)
                        )
                        .build();

                // Enviar peticion y recibir respuesta
                HttpResponse<String> response = client.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );

                int status = response.statusCode();

                // Respuesta correcta
                if (status >= 200 && status < 300) {

                    System.out.println(
                            "Respuesta recibida correctamente de Gemini."
                    );

                    return extraerTextoRespuesta(response.body());
                }

                // Reintentar si Gemini esta saturado
                if ((status == 503 || status == 429)
                        && intento < 3) {

                    int espera = intento * 3000;

                    System.out.println(
                            "Gemini esta ocupado. HTTP " + status
                    );

                    System.out.println(
                            "Esperando " + espera / 1000
                                    + " segundos para reintentar..."
                    );

                    Thread.sleep(espera);

                    continue;
                }

                // Si se agotan los intentos o existe otro error
                System.out.println(
                        "Error de Gemini. Codigo HTTP: " + status
                );

                return "Error de Gemini (HTTP "
                        + status + "): " + response.body();
            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            return "La solicitud fue interrumpida.";

        } catch (HttpTimeoutException e) {

            return "Error: Gemini tardo demasiado en responder. "
                    + "Intenta nuevamente.";

        } catch (Exception e) {

            return "Error al conectar con Gemini: "
                    + e.getMessage();
        }

        return "Error: Gemini no pudo responder despues de "
                + "3 intentos.";
    }

    // EXTRAER RESPUESTA DE GEMINI

    private static String extraerTextoRespuesta(String json) {

        Pattern pattern = Pattern.compile(
                "\"text\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\""
        );

        Matcher matcher = pattern.matcher(json);

        if (matcher.find()) {

            return matcher.group(1)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\\\", "\\");
        }

        return "No se pudo interpretar la respuesta de Gemini.";
    }

    // ESCAPAR CARACTERES JSON

    private static String escaparJson(String texto) {

        StringBuilder resultado = new StringBuilder();

        for (int i = 0; i < texto.length(); i++) {

            char c = texto.charAt(i);

            switch (c) {

                case '"' -> resultado.append("\\\"");
                case '\\' -> resultado.append("\\\\");
                case '\n' -> resultado.append("\\n");
                case '\r' -> resultado.append("\\r");
                case '\t' -> resultado.append("\\t");
                case '\b' -> resultado.append("\\b");
                case '\f' -> resultado.append("\\f");

                default -> {

                    if (c < 0x20) {

                        resultado.append(
                                String.format("\\u%04x", (int) c)
                        );

                    } else {

                        resultado.append(c);
                    }
                }
            }
        }

        return resultado.toString();
    }

    // ENVIAR RESPUESTA AL FRONTEND

    private static void enviarJson(
            HttpExchange exchange,
            int status,
            String json
    ) throws IOException {

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

        try {
            exchange.getResponseHeaders().set(
                    "Content-Type",
                    "application/json; charset=UTF-8"
            );

            exchange.sendResponseHeaders(status, bytes.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
                os.flush();
            }

            System.out.println(
                    "RESPUESTA ENVIADA CORRECTAMENTE."
            );

        } catch (IOException e) {

            System.out.println(
                    "ERROR AL ENVIAR RESPUESTA: " + e.getMessage()
            );

            throw e;

        } finally {
            exchange.close();
        }
    }

}