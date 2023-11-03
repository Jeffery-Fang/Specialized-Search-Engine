const {Matrix} = require("ml-matrix");

function euclideanDistance(m1, m2){
    /*
        function to calculate the euclidean distance between 2 vectors
    */

    let sum = 0;

    for(let i = 0; i < m1.rows; i++){
        for(let j = 0; j < m1.columns; j++){
            sum += (m1.get(i,j) - m2.get(i,j)) ** 2;
        }
    }

    return Math.sqrt(Math.abs(sum));
}

function isSteadyState(rankVector, probabilityMatrix){
    /*
        function to determine if the rank vector has reached a steady state
    */

    let nextIteration = rankVector.mmul(probabilityMatrix);

    return (euclideanDistance(rankVector, nextIteration) <= 0.0001);
}

function calculatePageRank(probabilityMatrix, N, alpha){
    /*
        function to calculate page rank
    */


    for(let i = 0; i < N; i++){
        let temp = probabilityMatrix.getRow(i);
        let ones = temp.reduce((sum, current) => {
           return sum + current
        },0);

        if(ones == 0){
            for(let j = 0; j < N; j++){
                probabilityMatrix.set(i, j, 1/N);
            }
        }else{
            for(let j = 0; j < N; j++){
                probabilityMatrix.set(i, j, probabilityMatrix.get(i, j)/ones);
            }
        }
    }

    probabilityMatrix = probabilityMatrix.mul(1 - alpha);
    probabilityMatrix = probabilityMatrix.add(alpha/N);

    let x0 = new Matrix([[1, 0, 0]]);

    while(!isSteadyState(x0, probabilityMatrix)){

        x0 = x0.mmul(probabilityMatrix);
    }

    return x0;
}

module.exports = {calculatePageRank}