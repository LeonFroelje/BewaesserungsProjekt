#include "RequestHeaders.hpp"
#include "RequestBody.hpp"

class Request{
    public:
        explicit Request(std::string &request);
        RequestHeaders getHeaders();
        RequestBody getBody();

    private:
        RequestHeaders headers;
        RequestBody body;
        int findBodyStart(std::string &request);
};

Request::Request(std::string &request){
    int bodyStart = findBodyStart(request);
    RequestHeaders h{request.substr(0, bodyStart)};
    headers = h;
    std::string xd{"GET"};
    if(headers.getMethod().compare(xd) != 0){
        RequestBody b{request.substr(bodyStart + 1, request.size())};
        body = b;
    }
};

int Request::findBodyStart(std::string &request){
    return request.find_first_of("\n\n");
}

RequestHeaders Request::getHeaders(){
    return headers;
}

RequestBody Request::getBody(){
    return body;
}