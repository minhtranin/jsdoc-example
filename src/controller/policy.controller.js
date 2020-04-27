/**@namespace*/

class PolicyController {
    /**
     * Add two numbers
     * @param {number} n1 - First number
     * @param {number} n2 - Second number
     * @returns {number} - Sum of n1 and n2
     */
    list(req, res) {
        const body = req.body;
        return [
            {
                policyId: '123123',
                description: 'policy'
            }
        ]
    }
}
export default PolicyController
