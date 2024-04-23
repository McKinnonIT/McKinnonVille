class HouseNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = "HouseNotFound";
        this.code = 404;
    }
}