class HouseNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = "HouseNotFound";
        this.code = 404;
    }
}

class DateOutOfRange extends Error {
    constructor(message) {
        super(message);
        this.name = "DateOutOfRange";
        this.code = 400;
    }
}