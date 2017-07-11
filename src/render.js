import 'svelte/ssr/register'

import rp from 'request-promise-native'
import Handlebars from 'handlebars'
import { groupBy } from './js/libs/arrayObjectUtils.js'
import mainTemplate from './src/templates/main.html!text'
import gridPicTemplate from './src/templates/gridPic.html!text'
import detailItemTemplate from './src/templates/detailItem.html!text'

let mainEl;
let sections;

export async function render() {
    let data = await loadData();

    var compiledHTML = compileHTML(data);
    return compiledHTML;
}

function formatData(data) {

    let output = data.sheets.people;
    // let sectionsCopy = data.sheets.sectionHeads;
    let count = 0;

    output.map((obj) => {
        obj.ref = count;
        obj.formatName = obj.name.split(",")[0];
        obj.sortName = obj.family_name + obj.formatName;
        obj.sortOn = obj.family_name.charAt(0).toUpperCase();
        !obj.age ? obj.age = "unknown" : obj.age = obj.age.toString();
        !obj.status ? obj.status = "unknown" : obj.status = obj.status.toString().toLowerCase();
        !obj.floor ? obj.floor = "unknown" : obj.floor = obj.floor;
        obj.ageGroup = getAgeGroup(obj.age);

        obj.id = obj.name.replace(/[^0-9a-z]/gi,'');

        console.log(obj.floor);

        count++;
    })


    output.sort(function(a, b) {
        if (a.sortName < b.sortName) return -1;
        if (a.sortName > b.sortName) return 1;
        return 0;
    })




    return output;
}



function sortByKeys(obj) {
    let keys = Object.keys(obj),
    i, len = keys.length;

    keys.sort();

    var a = []

    for (i = 0; i < len; i++) {

        let k = keys[i];
        let t = {}
        t.sortOn = k;
        t.objArr = obj[k]
        a.push(t);
    }

    return a;
}

function getAgeGroup(age) {
    let ageGroup = "unknown";
    if (!isNaN(age)) {

        if (age < 19) { ageGroup = "18 and under" }
        if (age > 18 && age < 35) { ageGroup = "18-34" }
        if (age > 34 && age < 45) { ageGroup = "34-44" }
        if (age > 44 && age < 66) { ageGroup = "45-65" }
        if (age > 65) { ageGroup = "over 65" }
    }
   
    return ageGroup;
}


function getAgeGroupStr(obj) {

    
    let ageGroup = obj.sortOn;
    let count = obj.count;
    let ageGroupStr = " ";

        if (ageGroup == "18 and under"){ ageGroupStr = "under&nbsp;18" }
        else if (ageGroup == "18-34" ){ ageGroupStr = "aged&nbsp;18–34" }
        else if (ageGroup == "34-44"){ ageGroupStr = "aged&nbsp;34–44" }
        else if (ageGroup == "45-65"){ ageGroupStr = "aged&nbsp;45–65" }
        else if (ageGroup == "over 65"){ ageGroupStr = "over&nbsp;65" }
        else if (ageGroup == "unknown"){ ageGroupStr = "unknown" }
    
    return ageGroupStr;
}



function compileHTML(dataIn) {
    
    let data = dataFormatForHTML(dataIn);

    Handlebars.registerHelper('html_decoder', function(text) {
          var str = unescape(text).replace(/&amp;/g, '&');
          return str; 
    });

    Handlebars.registerPartial({
        'gridPic': gridPicTemplate,
        'detailItem': detailItemTemplate
    });

    var content = Handlebars.compile(
        mainTemplate, {
            compat: true
        }
    );

    var newHTML = content(data);

    return newHTML
}

function dataFormatForHTML(dataIn){
    let totalCount = dataIn.length;
    
    sections = groupBy(dataIn, 'sortOn');
    sections = sortByKeys(sections);

    let ageGroupArr = groupBy(dataIn, 'ageGroup');
    ageGroupArr = sortByKeys(ageGroupArr);
    ageGroupArr.map((obj) => {
        obj.count = obj.objArr.length; 
        obj.ageGroupStr = getAgeGroupStr(obj);

    });


//console.log(statusArr)

    let statusArr = groupBy(dataIn, "status");
    statusArr = sortByKeys(statusArr);
    statusArr.map((obj) => {
        obj.count = obj.objArr.length;        
    });


    var data = {
        pageSections: sections,
        totalCount : totalCount,
        ageGroups : ageGroupArr,
        statusCounts : statusArr
    }

    data.pageSections.map((obj) => {
        var last = obj.objArr.length - 1;
        obj.objArr[last].lastItem = true;
    })

    

    var sortStr = data.pageSections[0].sortOn;

    data.pageSections.map((obj) => {
        var last = obj.objArr.length - 1;
        obj.objArr[last].lastItem = true;
    })

    return data
}

// broke this out into a function so it could also be used in the gulpfile for the image resizing
export async function loadData() {
    let data = formatData(await rp({
        uri: 'https://interactive.guim.co.uk/docsdata-test/1K896qTOpgJQhG2IfGAChZ1WZjQAYn7-i869tA5cKaVU.json',
        json: true
    }));

    return data;
}