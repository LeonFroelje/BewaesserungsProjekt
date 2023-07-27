#define PWMFreq 5000
#define rChannel 0
#define gChannel 1
#define bChannel 2
#define PWMRes 10
#define MAX_DUTY_CYCLE (int)(pow(2, PWMRes) - 1)

enum Color{
    RED,
    GREEN,
    BLUE
};

class StatusLED{
public:
    StatusLED(int rPin, int gPin, int bPin);

    void on(int brightness, Color color);
    void on(Color color);
    void off(Color color);
    void off();

private:
    int rPin;
    int gPin;
    int bPin;
};

StatusLED::StatusLED(int rPin, int gPin, int bPin):
    rPin(rPin),
    gPin(gPin),
    bPin(bPin){
        ledcSetup(rChannel, PWMFreq, PWMRes);
        ledcSetup(gChannel, PWMFreq, PWMRes);
        ledcSetup(bChannel, PWMFreq, PWMRes);
        ledcAttachPin(rPin, rChannel);
        ledcAttachPin(gPin, gChannel);
        ledcAttachPin(bPin, bChannel);
    };


void StatusLED::on(int brightness, Color color){
    if(color == RED){
        ledcWrite(rChannel, (int)(MAX_DUTY_CYCLE * (brightness / 100)));
    }
    else if(color == GREEN){
        ledcWrite(gChannel, (int)(MAX_DUTY_CYCLE * (brightness / 100)));
    }
    else{
        ledcWrite(bChannel, (int)(MAX_DUTY_CYCLE * (brightness / 100)));
    }
}

void StatusLED::on(Color color){
    this -> on(100, color);
}

void StatusLED::off(Color color){
    this -> on(0, color);
}

void StatusLED::off(){
    this -> on(0, RED);
    this -> on(0, GREEN);
    this -> on(0, BLUE);
}