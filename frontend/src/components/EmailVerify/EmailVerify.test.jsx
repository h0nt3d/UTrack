describe("Email Verification", () => {

   test("OTP is always 6 digits", () => {
      for(i = 0; i < 100000; i++) {
         const generated = Math.floor(100000 + Math.random() * 900000).toString();
         expect(generated.length).toBe(6);
      }
   });

   test("OTP is unique", () => {
      const generated1 = Math.floor(100000 + Math.random() * 900000).toString();
      const generated2 = Math.floor(100000 + Math.random() * 900000).toString();
      expect(generated1).not.toBe(generated2);
   });

});