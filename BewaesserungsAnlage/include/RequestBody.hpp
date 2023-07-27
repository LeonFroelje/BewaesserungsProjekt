class RequestBody{
    public:
        RequestBody();
        explicit RequestBody(std::string body);
        std::string getBody();

    private:
        std::string body;
};

RequestBody::RequestBody(){};

RequestBody::RequestBody(std::string body){
    this -> body = body;
};

std::string RequestBody::getBody(){
    return body;
};