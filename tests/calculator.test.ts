import { expect } from "chai";
import {
  add,
  subtract,
  multiply,
  divide
} from "../src/calculator";

describe("calculator", () => { 
    it("should add two numbers", () => { 
        expect(add(2, 3)).to.equal(5); }); 
        
    it("should subtract two numbers", () => { 
        expect(subtract(5, 3)).to.equal(2); }); 
        
    it("should multiply two numbers", () => { 
        expect(multiply(2, 3)).to.equal(6); }); 
        
    it("should divide two numbers", () => { 
        expect(divide(10, 2)).to.equal(5); }); 
    
    it("should throw when dividing by zero", () => { 
        expect(() => divide(10, 0)).to.throw("Cannot divide by zero"); }); 
});