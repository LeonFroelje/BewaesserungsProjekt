#include <vector>

class Reading{
    public:
        Reading();
        explicit Reading(const std::vector<double> data);
        double getAverage();
        double getMinimum();
        double getMaximum();
        void add(double value);
        int size();
        double at(int index);

    private:
        std::vector<double> data;
};

Reading::Reading(const std::vector<double> data):
    data(data)
    {};

double Reading::at(int index){
    if(data.size() == 0){ return 0;};
    return data.at(index);
};

void Reading::add(double value){
    // append value of sensor reading to the data vector and increase the length
    data.push_back(value);
}

double Reading::getAverage(){
    double avg{0};
    if(data.size() == 0){ return 0;};
    // compute the sum of the sensor readings
    for(int i = 0; i < data.size(); i++){
        avg += data.at(i);
    }
    // divide by the amount of readings to get the average
    return (avg / ((double) data.size()));
}


double Reading::getMinimum(){
    if(data.size() == 0){ return 0;};
    double min = data.at(0);
    // if Element at position i is smaller than the previously smallest found Element, replace min with it
    for(int i = 1; i < data.size(); i++){
        if(data.at(i) < min){
            min = data.at(i);
        };
    }
    return min;
}

double Reading::getMaximum(){
    if(data.size() == 0){ return 0;};
    double max = data.at(0);
    // if Element at position i is greater than the previously largest found Element, replace max with it
    for(int i = 1; i < data.size(); i++){
        if(data.at(i) > max){
            max = data.at(i);
        }
    }
    return max;
}

int Reading::size(){return data.size();};
