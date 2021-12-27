

#include <WiFi.h>
#include <M5StickC.h>

float gyroX = 0.0F;
float gyroY = 0.0F;
float gyroZ = 0.0F;
float gyroY0 = 0.0F;

unsigned long t1 = millis();
unsigned long t0 = millis();

float gyro1 = 0.0F;
String gyrotest = "test"; 

const char* ssid     = "****";
const char* password = "****";

WiFiServer server(80);

void setup()
{
    M5.begin();
    M5.IMU.Init();  //Init IMU.  初始化IMU
    M5.Lcd.setRotation(3);
    M5.Lcd.setCursor(40, 0);
    M5.Lcd.println("IMU TEST");
    M5.Lcd.setCursor(0, 10);
    M5.Lcd.println("   X       Y       Z");
    M5.Lcd.setCursor(0, 50);
    M5.Lcd.println("  Pitch   Roll    Yaw");
  
    Serial.begin(115200);
    pinMode(5, OUTPUT);      // set the LED pin mode

    delay(10);

    // We start by connecting to a WiFi network

    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected.");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    
    server.begin();
    t0 = millis();

}

int value = 0;

void loop(){

  
 WiFiClient client = server.available();   // listen for incoming clients
 
    M5.IMU.getGyroData(&gyroX,&gyroY,&gyroZ);
    M5.Lcd.setCursor(0, 20);
    M5.Lcd.printf("%6.2f  %6.2f  %6.2f o/s\n", gyroY, gyroY0, gyroZ);
    Serial.printf("%6.2f  %6.2f  %6.2f o/s\n", gyroY, gyroY0, gyroZ);
    t1 = millis();
//    if (gyroY>10 | gyroY<10)
      gyroY0 += (gyroY-2);
    t0 = t1;
    
  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client

    
    while (client.connected()) {            // loop while the client's connected

      
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }

        // Check to see if the client request was "GET /H" or "GET /L":
        if (currentLine.endsWith("GET /reset")) {
//          digitalWrite(5, HIGH);               // GET /H turns the LED on
          gyroY0 = 0;
        }
        if (currentLine.endsWith("GET /angle")) {
//          digitalWrite(5, LOW);                // GET /L turns the LED off
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: application/json");
          client.println();
          String res = String(gyroY0);
          client.print("{\"angle\" : " + res + "}");
          client.println();
//          client.println("Connection: close");
        }
      }
    }
    // close the connection:
    client.stop();
    Serial.println("Client Disconnected.");
  }
}
