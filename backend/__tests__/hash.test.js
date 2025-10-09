const hash = require('../routes/hash');

describe("Hash", () => {
    
    test("Bcrypt generates different hashes for same input", async () => {
        input1 = "password123";
        input2 = "password123";
        output1 = await hash.hashPassword(input1);
        output2 = await hash.hashPassword(input2);
        
        expect(output2).not.toBe(output1);
    });

    test("Bcrypt compares with same input", async () => {
        input = "password123";
        output1 = await hash.hashPassword(input);
        output2 = await hash.hashPassword(input);
        compare1 = await hash.comparePassword(input,output1);
        compare2 = await hash.comparePassword(input,output2);
        
        expect(compare1).toBe(true);
        expect(compare2).toBe(true);
    });

    test("Bcrypt generates different hashes for different input", async () => {
        input1 = "password123";
        input2 = "Password123";
        output1 = await hash.hashPassword(input1);
        output2 = await hash.hashPassword(input2);
        
        expect(output2).not.toBe(output1);
    });

    test("Bcrypt compares with different inputs", async () => {
        input1 = "password123";
        input2 = "Password123";
        output1 = await hash.hashPassword(input1);
        output2 = await hash.hashPassword(input2);
        
        compare1 = await hash.comparePassword(input1,output1);
        compare2 = await hash.comparePassword(input1,output2);
        compare3 = await hash.comparePassword(input2,output1);
        compare4 = await hash.comparePassword(input2,output2);

        expect(compare1).toBe(true);
        expect(compare2).toBe(false);
        expect(compare3).toBe(false);
        expect(compare4).toBe(true);
    });
});
