var colors = [];
//var colors = [[0, 0, 0]];
//specific RGB color for each radii //global
let GenSketch = function (p) {
    var maxradius = 1;
    var minprimeradius = 4;
    var palindrome = [];
    var sidewaysgap = 5; //redundant
    var textsize = 11;

    //palindrome = [1, 3, 1, 1, 1, 3, 1, 5, 1, 1, 1, 5, 1, 3, 1, 1, 1, 3, 1];
    //palindrome = [1, 1, 1, 9, 1, 1, 1, 5, 1, 5, 1, 3, 1, 5, 1, 5, 1, 1, 1, 9, 1, 1, 1];
    //palindrome = [1, 3, 1, 1, 1, 3, 1, 13, 1, 3, 1, 1, 1, 3, 1];
    //palindrome=[1,2,2,4,2,4,2,4,6,2,6,4,2,4,6,6,2,6,4,2,6,4,6,8,4,2,4,2,4,14,4,6,2,10,2,6,6,4,6,6,2,10,2,4,2,12,12,4,2,4,6,2,10,6,6,6,2,6,4,2,10,14,4,2,4,14,6,10,2,4,6,8,6,6,4,6,8,4,8,10,2,10,2,6,4,6,8,4,2,4,12,8,4,8,4,6,12];

    //var scalingfactor = 10; //set this dynamically based on maxradius and length
    var xoffset = 0;
    //var windowWidth = window.innerWidth;
    var windowWidth = 1500; //set this dynamically based on scaling factor
    var windowHeight = 300;
    //var windowHeight = window.innerHeight;
    //var windowHeight = window.innerHeight;
    var len = 0;

    p.setup = function () {
        p.clear();
        p.noFill();
        //populate palindrome from BCS
        palindrome = [];
        maxradius = 1;

        if (view == "1") {
            //uncompacted view uses outputArray
            if (paliPreviewIndex < 0) {
                //exclude isNested 
                for (i = 0; i < outputArray.length; i++) {
                    // if (outputArray[i][0].split(',').length >= minpalisize * 2 + 1 && outputArray[i][0].split(',').length <=
                    //     maxpalisize * 2 + 1)
                    if (showNested || !showNested && !outputArray[i][4])
                        palindrome.push(outputArray[i]);
                }
                len = Math.min(numbers.length, 20000); //limiting uncompacted view to 20k
            } else {
                //preview only a single row of outputArray
                //centre = palindrome[0][2];
                if (showNested) {
                    //nest ALL smaller ones 
                    for (i = 0; i < outputArray.length; i++) {
                        //array could be sorted by centre or by palindrome size (or something else in the future)
                        if (outputArray[i][1] >= outputArray[paliPreviewIndex][1] && outputArray[i][3] <= outputArray[paliPreviewIndex][3])
                            palindrome.push(outputArray[i]);
                        palindrome.sort(sortbyStart);

                    }
                } else
                    palindrome.push(outputArray[paliPreviewIndex]);
                len = outputArray[paliPreviewIndex][3] - outputArray[paliPreviewIndex][1] + 1;
            }
        } else {
            //compacted view uses BCS
            if (paliPreviewIndex < 0)
                palindrome = BCS;
            else {
                //preview is a subset of BCS
                for (i = 0; i < BCS.length; i++) {
                    if (BCS[i][1] >= outputArray[paliPreviewIndex][1] && BCS[i][2] <= outputArray[paliPreviewIndex][3])
                        palindrome.push(BCS[i]);
                }
            }
            len = palindrome.length;
        }
        //console.table(palindrome);
        //find maxradius from palindrome array
        if (view == "0") //compacted
            for (i = 0; i < palindrome.length; i++) {
                if (palindrome[i][0] > maxradius) maxradius = palindrome[i][0];
            }
        else //uncompacted
            for (i = 0; i < palindrome.length; i++) {
                if ((palindrome[i][3] - palindrome[i][1]) / 2 > maxradius) maxradius = (palindrome[i][3] - palindrome[i][1]) / 2;
            }
        //console.log('MR ' + maxradius);
        //populate color spectrum and reuse for preview
        if (paliPreviewIndex < 0) {
            colors = [];
            //colors = [[0, 0, 0]];
            for (i = 1; i <= maxradius; i++)
                colors.push([Math.floor((255 * i / maxradius) * (i % 3)),
                    Math.floor((255 * i / maxradius) * ((i + 1) % 3)),
                    Math.floor((255 * i / maxradius) * ((i + 2) % 3))
                ]);
        }
        scalingfactor = 0.95 * windowHeight / (2 * maxradius);
        //console.log('SSSFFF ' + scalingfactor);
        //check for sf<1 => increase winowHeight
        if (scalingfactor < 1) {
            windowHeight *= 1.5;
            scalingfactor *= 1.5;

        }
        //scalingfactor = Math.min(windowWidth / (palindrome.length), windowHeight / (2 * maxradius));
        //scalingfactor = Math.min(windowWidth,windowHeight) / Math.max(palindrome.length,2*maxradius)/2 ;
        windowWidth = (len + 2 * maxradius) * scalingfactor;

        //if sideways, need little more width
        //sidewaysgap = maxradius;
        if (sideways)
            windowWidth += (maxradius * 2) * scalingfactor;

        //check for maxwidth 32767 on chrome/firefox
        if (windowWidth > 32767) {
            //FUTURE: add multiple canvases
            scalingfactor *= 32767 / windowWidth;
            windowWidth = 32767;

        }
        console.log("width " + windowWidth);
        xoffset = (windowWidth - scalingfactor * (len - 1)) / 2;
        if (sideways) xoffset = ((windowWidth - (maxradius * 2) * scalingfactor) - scalingfactor * (len - 1)) / 2;
        //console.table(colors);
        p.createCanvas(windowWidth, windowHeight);
        p.noLoop();
    }

    p.draw = function () {
        p.background(255);
        p.stroke(108);
        p.strokeWeight(2);
        p.textAlign(p.CENTER);
        p.line(0, windowHeight / 2, windowWidth, windowHeight / 2);
        var topscalingfactor = ((scalingfactor < 1.5) ? 11 : (scalingfactor < 4) ? 7 : (scalingfactor < 10) ? 5 : (scalingfactor < 20) ? 3 : 1);
        var bottomscalingfactor = ((scalingfactor < 2) ? 5 : (scalingfactor < 10) ? 3 : 1);
        var x, x1; //sideways double circles
        var limit_sf_compacted = 2.6;
        var limit_sf_uncompacted = 1.5;
        var linedash = [0.5, 3];

        if (view == "0") { //compacted 
            if (scalingfactor < limit_sf_compacted) textsize /= 1.4;

            for (i = 0; i < palindrome.length; i++) {
                let radius = palindrome[i][0];
                let centre = palindrome[i][1];
                x = xoffset + scalingfactor * i;
                if (sideways) {
                    x1 = xoffset;
                    x = xoffset + scalingfactor * (i + maxradius * 2);
                }
                //compute shorthand centre label
                let centre_lable = centre;
                if (scalingfactor < limit_sf_compacted)
                    centre_lable = shorten(centre);
                //check prime
                if (numbers[centre - start][1]) {
                    p.stroke(51);
                    p.strokeWeight(0.8);
                    p.fill(51);
                    p.textSize(textsize);
                    if (printPrimes) {
                        //if (topscalingfactor <= 7 || (topscalingfactor > 7 && i % 3 == 0))
                        p.text(centre_lable, x, textsize * (i % topscalingfactor + 1));
                        p.drawingContext.setLineDash(linedash);
                        p.line(x, windowHeight / 2, x, textsize * (i % topscalingfactor + 1));
                        p.drawingContext.setLineDash([]);
                    }
                    // mark prime positions
                    p.fill('red');
                    if (sideways)
                        p.circle(x1, windowHeight / 2, Math.max(radius * scalingfactor, minprimeradius));
                    p.circle(x, windowHeight / 2, Math.max(radius * scalingfactor, minprimeradius));

                } else {
                    //check if centre is inside a plaindrome of length withn min and max
                    var goAhead = false;
                    for (var j = 0; j < outputArray.length; j++) {
                        pali = outputArray[j][0]; //palindrome
                        s = outputArray[j][1]; //start
                        e = outputArray[j][3]; //end
                        n = outputArray[j][4]; //isNested
                        l = outputArray[j][5]; //length
                        if (showNested || !showNested && !n) //showNested has noeffect on compacted view
                            if (centre >= s && centre <= e && l >= minpalisize && l <= maxpalisize)
                                if (searchStr == "" || searchStr != "" && evalSearch(pali)) {
                                    goAhead = true;
                                    break;
                                }
                    }
                    if (goAhead) {
                        if (radius <= colors.length)
                            p.stroke(colors[radius - 1][0], colors[radius - 1][1], colors[radius - 1][2]);
                        p.strokeWeight(2);
                        p.noFill();
                        if (sideways)
                            p.circle(x1, windowHeight / 2, 2 * radius * scalingfactor);
                        p.circle(x, windowHeight / 2, 2 * radius * scalingfactor);
                        p.fill(colors[radius - 1][0], colors[radius - 1][1], colors[radius - 1][2]);
                        p.strokeWeight(0.8);
                        p.textSize(textsize);
                        if (printRadii) {
                            p.text(radius, x, windowHeight - textsize * (i % bottomscalingfactor + 1));
                            //p.text(centre, xoffset + scalingfactor * i, radius * scalingfactor - textsize + windowHeight / 2);
                            p.drawingContext.setLineDash(linedash);
                            p.line(x, windowHeight / 2, x, windowHeight - textsize * (i % bottomscalingfactor + 2));
                            p.drawingContext.setLineDash([]);
                        }
                    }
                }
            }
        } else {
            //uncompacted number line
            if (scalingfactor < limit_sf_uncompacted) textsize /= 1.4;
            var i_ = 0;
            if (paliPreviewIndex >= 0)
                i_ = palindrome[0][1] - start;
            for (k = i_; k < i_ + len; k++) {
                i = k - i_;
                x = xoffset + scalingfactor * i;
                if (sideways) {
                    x1 = xoffset;
                    x = xoffset + scalingfactor * (i + maxradius * 2);
                }
                let centre = numbers[k][0];
                //compute shorthand centre label // not needed for uncompacted view
                let centre_lable = centre;
                if (scalingfactor < limit_sf_uncompacted)
                    centre_lable = shorten(centre);
                //check and mark primes
                if (numbers[k][1]) {
                    p.stroke(51);
                    p.strokeWeight(0.8);
                    p.fill(51);
                    p.textSize(textsize);
                    if (printPrimes) {
                        p.text(centre_lable, x, textsize * (i % topscalingfactor + 1));
                        //draw labelling line
                        p.drawingContext.setLineDash(linedash);
                        p.line(x, windowHeight / 2, x, textsize * (i % topscalingfactor + 1))
                        p.drawingContext.setLineDash([]);
                    }
                    // mark prime positions
                    p.fill('red');
                    if (sideways)
                        p.circle(x1, windowHeight / 2, Math.max(1 * scalingfactor, minprimeradius));
                    p.circle(x, windowHeight / 2, Math.max(1 * scalingfactor, minprimeradius));
                }
                //check number[i] in palindrome centre list
                for (j = 0; j < palindrome.length; j++) {
                    let radius = (palindrome[j][3] - palindrome[j][1]) / 2;
                    if (palindrome[j][5] >= minpalisize && palindrome[j][5] <= maxpalisize)
                        if (radius > 0 && centre == palindrome[j][2])
                            if (searchStr == "" || searchStr != "" && evalSearch(palindrome[j][0])) {
                                //draw the circle
                                if (radius <= colors.length)
                                    p.stroke(colors[radius - 1][0], colors[radius - 1][1], colors[radius - 1][2]);
                                p.strokeWeight(2);
                                p.noFill();
                                if (sideways)
                                    p.circle(x1, windowHeight / 2, 2 * radius * scalingfactor);
                                p.circle(x, windowHeight / 2, 2 * radius * scalingfactor);
                                p.fill(colors[radius - 1][0], colors[radius - 1][1], colors[radius - 1][2]);
                                p.strokeWeight(0.8);
                                p.textSize(textsize);
                                if (printRadii) {
                                    //p.text(centre_lable, xoffset + scalingfactor * i, maxradius * scalingfactor - textsize * (i % topscalingfactor + 1) + windowHeight / 2);
                                    p.text(centre_lable, x, windowHeight - textsize * (i % topscalingfactor + 1));
                                    //p.text(centre, xoffset + scalingfactor * i, textsize + windowHeight / 2);
                                    //print lable line
                                    p.drawingContext.setLineDash(linedash);
                                    p.line(x, windowHeight / 2, x, windowHeight - textsize * (i % topscalingfactor + 2))
                                    p.drawingContext.setLineDash([]);
                                }
                            }
                }
            }
        }
    }

    function shorten(number) {
        //retain first digit and last 3 digits, replace others with a .
        var short = "" + number;
        var str = short.split('');
        if (str.length >= 6) {
            //short = str[0];
            short = "...";
            for (var i = 1; i < str.length; i++) {
                if (i < str.length - 4) {
                    //if (short.indexOf("_") < 0) short += "_";
                } else
                    short += "" + str[i];
            }
        }
        return short;
    }
}