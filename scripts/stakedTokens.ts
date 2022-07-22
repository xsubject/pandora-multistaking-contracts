const __stakedTokensSrc = [
    7977,
    7978,
    7979,
    7976,
    7974,
    7973,
    7975,
    7972,
    7970,
    7971,
    7980,
    7983,
    7981,
    7982,
    7969,
    7968,
    7967,
    7965,
    7966,
    7964,
    7963,
    7962,
    7960,
    7959,
    7958,
    7957,
    7956,
    7955,
    7954,
    7952,
    7948,
    7947,
    7946,
    7945,
    7944,
    7943,
    7942,
    7941,
    7940,
    7939,
    7938,
    7937,
    7698,
    7696,
    7699,
    7697,
    7693,
    7695,
    7694,
    7692,
    7690,
    7691,
    7689,
    7688,
    7687,
    7685,
    7682,
    7679,
    7518,
    7389,
    7216,
    7207,
    7200,
    6283,
    2375,
    9342,
    13351,
    708,
    7291,
    7339,
    8581,
    13588,
    9894
];

const __added: number[] = [];

const stakedTokens = __stakedTokensSrc.map(item => {
    if(__added.indexOf(item) !== -1) {
        throw Error("Staked tokens src and result len not eq, double item: " + item);
    }
    __added.push(item);
    return item;
});


// if(stakedTokens.length != __stakedTokensSrc.length) {
//     throw Error("Staked tokens src and result len not eq");
// }

export default stakedTokens;