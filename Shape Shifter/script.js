const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/*** Canvas Settings ******/
ctx.lineCap = 'round';
ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
ctx.shadowOffsetX = 10;
ctx.shadowOffsetY = 5;
ctx.shadowBlur = 10;


/* effect settings */
let width = canvas.width;
let height = canvas.height;
const maxLevel = 4;
const branches = 2;
let sides = 5;  
let size = width < height ? width * 0.25 : height * 0.25;
let degree = 0.4;  /* this is set to radians */
let scale = 0.7;
let color = `hsl(${Math.random() * 360}, 100%, 50%)`;
let lineWidth = Math.floor(Math.random() * 20 + 10);

/*****Controls *****/
const randomizeButton = document.querySelector('#randomize');
const sliderDegree = document.getElementById('degree');
const labelDegree = document.querySelector('[for="degree"]');
const sliderSides = document.getElementById('sides');
const labelSides = document.querySelector('[for="sides"]');
labelDegree.style.color = 'white';
labelSides.style.color = 'white';
const controls = document.getElementById('controls');


/***** fractal ******/
function drawBranch(level) {  
    if(level > maxLevel) return;
    ctx.beginPath();
    ctx.moveTo(0, 0); /* 1 */
    ctx.lineTo(0, - size);
    ctx.stroke();
    for(let i = 0; i < branches; i++) { /* for each branch do this */
        ctx.save();  /* 2 */
        ctx.translate(0, - size + ( size / branches) * i); /* 3 */
        ctx.rotate(degree);
        ctx.scale(scale, scale); /* 4 */
        drawBranch(level + 1);
        ctx.restore();
    
        ctx.save();
        ctx.translate(0, - size + ( size / branches) * i);
        ctx.rotate(-degree);
        ctx.scale(scale, scale);
        drawBranch(level + 1);
        ctx.restore();
    }
   
}


function drawFractal() {  /* 5 */
    ctx.clearRect(0, 0, width, height); /* 6 */
    ctx.save();
    ctx.lineWidth = lineWidth;  /* 6 */
    ctx.strokeStyle = color;    /* 6 */
    ctx.translate(width / 2, height / 2);
    for(let i = 0; i < sides; i++) {
        ctx.rotate((Math.PI * 2) / sides);  /* 7 */
        drawBranch(0);  /* 8 */
    }    
    updateSlider();
    ctx.restore();
}
drawFractal();

function randomizeFractal() {  /* 9 */
    sides = Math.floor(Math.random() * 7 + 2);
    degree = Math.random() * 2.9 + 0.5;
    scale = Math.random() * 0.2 + 0.4 ;
    color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    lineWidth = Math.floor(Math.random() * 20 + 10);
    randomizeButton.style.background = color;
    drawFractal();
}

function updateSlider() {
    sliderDegree.value = degree;
    labelDegree.innerText = `Degree: ${Number(degree).toFixed(1)}`;
    sliderSides.value = sides;
    labelSides.innerText = `Sides: ${sides}`;
}

function degreeSlider(e) {
    degree = e.target.value;
    updateSlider();
    drawFractal();

}

function sidesSlider(e) {
    sides = e.target.value;
    updateSlider();
    drawFractal();

}


randomizeButton.addEventListener('click', randomizeFractal);
sliderDegree.addEventListener('change', degreeSlider);
sliderSides.addEventListener('change', sidesSlider);


/****** Comments *******/

/*
1: first we drew another rectangle the size of the entire canvas on top of the previous one, applied to it translate(width/2, height/2) which places the top left corner in the middle of the screen. we then drew our line on the top left side of this rectangle with ctx.moveTo(0, 0) and ctx.lineTo(0, - size). we set "size" to 150

2: *******save() and restore() *********
sometimes in our projects we want to translate scale and rotate to only affect certain shapes and then we want it to reset back to normal so that other shapes remain unaffected for that we have two very useful built-in methods called save and restore.  built-in canvas save method saves the entire state of canvas not only translate rotate and scale, it saves all canvas properties and their settings at that point in our code base including things like fill style, line width and so on. when we call restore it restores the most recently saved canvas state for us. 

3:   ******* drawBranch *********
Next, we create a drawBranch(). it's function will be to draw a line rotate canvas and call itself again to draw another segment of that line under a different angle. depending on how many times we allow draw branch function to call itself we will get different amount of segments and overall different fractal shape. now when i call draw branch it just draws a simple line now i want this function to call itself to draw another segment but we have to be careful here because if i just simply call function from within itself we can create an endless loop, anyway i need to introduce some kind of counter that increases every time the function calls itself and when it reaches it the loop will stop, i do that by passing it a variable called here "level" and each time the function calls itself it will increase level by 1. we need to pass level as a parameter so that it expects that argument and inside i say if level is more than max level return. i declare that "maxLevel" variable in line 20 and set it to 4 now i just need to pass it initial value for level which will be zero.

4: ******* Scale(x, y) *********
I can also scale the canvas between each segment let's try 0.7 0.7 before i rotate i can also translate that rotation center point along the branch. if i translate by additional 75 pixels along the line we drew we get each new segment on the branch growing from the middle of the previous one
i can change where my segments connect by translating to different values, i can also change rotation angle between each segment and also play with scale. so we need to add our "branches" variable up in line 21 and we set it to 2. in order to have one branch stem to the right and the other to the left we need to set rotate to positive for one side and negative for the other. we add this code to our drawBranch().
    for(let i = 0; i < branches; i++) { 
        ctx.save();
        ctx.translate(0, - size + ( size / branches) * i);
        ctx.rotate(degree);
        ctx.scale(scale, scale);
        drawBranch(level + 1);
        ctx.restore();

        ctx.save();
        ctx.translate(0, - size + ( size / branches) * i);
        ctx.rotate(-degree);
        ctx.scale(scale, scale);
        drawBranch(level + 1);
        ctx.restore();
    }

Notice that this piece of code will apply to each new branch created, meaning, each "branch" will get 2 sides added to it, one to the right of it and one to the left. and since we set "branches" to 2 then we will have 4 stems, 2 for each "Branch". so now we drew 2 branches per segment and because we set "maxLevel" to 4 we get 5 segments. because we set max level to 4 + the first line we drew. we call drawBranch() and pass it level zero. drawBranch(0) checks if level is more than "maxLevel" , 0 is not more than 4 so this code runs and draws a line then translates() rotates() and scales() and drawBranch(0) calls itself and increases its level by 1. that repeats over and over until level is more than "maxLevel". 
now we have two sets of segments growing out from the main parent branch. what if i want them to move along and grow from the other end. i can simply do that by saying (size - (size / branches) * i).
Also, look at what max level does it will give the fractal shape another level of depth to see it clearly i need to adjust scale let's put the "scale" value into a variable and set it to 0.7 in line 23 and i replace all these values. we pass the canvas scale() method with this new scale variable and also play with "maxLevel" value and we have a fractal. if at any point your fractal shapes take too long to render the easiest thing to do is to come to maxLevel variable and set it to a smaller value doing that will radically decrease the number of operations needed to draw the fractal shape.

5:  ****** drawing the Fractal *******
function drawFractal() {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    for(let i = 0; i < sides; i++) {
        ctx.rotate((Math.PI * 2) / sides);
        drawBranch(0);
    }
    ctx.restore();
}
drawFractal();

now we have the code to draw a single a single stem and 2 branches in our fractal if i want to make a circular fractal shape i put this for loop inside and i call drawBranch() from within the for loop. i cut save() and translate() calls from up here and i paste them inside my draw fractal function outside the for loop. i'm saving canvas on line 75 so i need to put restore inside that function as well and this is how you make a fractal snowflake.

6: ******* lines added later ******
these lines are added later and we will talk about them then.
if we change the value of "sides" we will get different number of branches that are evenly distributed to form a full circle. max level determines depth of the fractal how many times will branches split into smaller segments before fractal shape is finished. "scale" determines how much smaller are these segments compared to their parent branch, the "degree" value is the angle in radians between parent branches and their segments, a reasonable range is somewhere between 0.1 radians and 2.9 radians so almost half a circle. i change "lineWidth" to 10 pixels so we can see more details in the shape. "degree" can be 0.5 for now. i set canvas background to black and give it some shadow in lines 8 - 11. shadow would be more visible if background was not black but i still like how it gives the fractal more details even like this especially when the lines are thicker.
Randomized HSL colors:
you can also assign colors using hsl color declaration hue (the first value) is angle on color wheel so value between 0 and 360 will cycle through the entire color spectrum, angle 0 on hsl color wheel is red color, by changing angle value we pass as a hue to "color" variable in line 24 we can cycle through color spectrum it doesn't even stop at 360 degrees we can increase it more and more and it will just keep circling around 0 is red and 360 is red as well because it circled back again. saturation (the 2nd value) 0% is grayscale, 100% is fully saturated color. when it comes to lightness (the last value) 0% is dark and 100% is light, 50 is full color not affected by light or dark at all.  i cut strokeStyle from line 8 and i paste inside drawFractal(). i set it to this new "color" variable in line 24 and randomize it's value on each page reload Hue, the first value, will be a random number between 0 and 360 to cover all possible colors.
i would like the size of my fractals to be restricted by height of available canvas area so i will use a ternary operator in line 19 which simply means if canva's width is less than canvas height set the "size" variable to canvas width times 0.25 else set size to canvas height times 0.25 now the size of our fractal will be restricted by either width or height of canvas depending on which one is smaller this means we can always see the entire fractal shape on wide and on tall screens.

7:  ***** adding more lines to the canvas ********
to draw more identical lines on top of each other i draw one line, rotate canvas and then draw the other one and then i rotate and draw another one and another one etc... like this 
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, - size);
    ctx.stroke(); 
and repeat it as many times as the number of lines that we want. when you see a lot of code repetition like this it usually means it's a good time to use a loop, i delete all the additional lines and create a for loop. let's create a sides variable which will determine how many lines it will draw, let's give it 5, each time this for loop runs it will draw a line, rotate canvas by 0.5 radians and draw a line again until it reaches the number of sides. i can increase sides to add more lines rotated around the center of canvas. rotate method doesn't take angle value in degrees as it does in CSS, here it takes a value in radians, half circle is 180 degrees which is approximately 3.14 radians it's exactly the value of pi. so if i rotate(Math.pi) we rotate by half circle before we draw the second line. Math.PI * 2 is roughly 6.28 radians or 360 degrees so full circle which means we drew a line rotated around the whole circle and we drew a line again so now our lines are covering each other. what if i want to rotate by a value that splits the circle into slices depending on the value of sides variable?  i can say Math.pi * 2 divided by sides. because we set "sides" to 5, each time we draw a line it will rotate canvas by 1 5th of a circle. now when i increase sides lines will always rotate so that they slice the whole circle into number of sides with equal size

8: here we call drawBranches(0) because we want to populate each stem (sides) with branches.

9:  I create a button element with an id of randomize and text randomize, we can't see it because canvas has position absolute so it's on top of it
if i set controls to position absolute as well now it's visible. let's create an area in script file for controls i bring my randomize button
into the project i create a custom function i call it randomizeFractal() whenever this function runs some of the effect settings will be randomized
to a different value changing shape of the fractal some of these settings i don't want to be randomized for example i want maxLevel to stay the
same so i set it to const remember that if it takes too long to render fractal shapes on your computers the easiest fix is to come here and set max
level to 3 this will decrease the depth of fractal by one level and it will massively reduce the number of calculations and draw calls needed to
create the final shape. i also want two branches per segment so this will also be const you can experiment with different values here to see what
happens try one or three you may get some interesting unique shapes these remaining four values in lines 20 - 24 will stay as "let" variables and we will randomize them each time randomized button is pressed so let's copy them and delete the "let" keywords because we are not declaring new variables we are reassigning values to existing variables here.
sides could be a random number between 2 and 9 for example scale will be random value between 0.4 and 0.6, degree angle will be 0.1 and we go all the way to until the branches rotate almost half circle around which is around 3 radians, almost 180 degrees but not quite "degree" will be a random number between 0.1 and 3.
color is already randomized since we are using math.random on new argument we pass to hsl color declaration.
i take randomize button and i add event listener to it we will listen for click event and we will run randomize fractal function after we randomize fractal we also need to draw the new one with updated values in line 93, i also have to delete canvas every time i generate new fractals so i call built-in clearRect() method inside drawFractal() and i clear the entire canvas from coordinate 0 0 to canvas with canvas height.
you can see there is one branch here that is off strange let's see what i did. i can finally see what the problem was some of you probably already
realized it, the number of sides needs to be an integer number without decimal points here i'm randomizing and getting values
like 8.3 so my fractal has 8.3 sides let's wrap it in Math.floor() so that we get even slices.
also I will randomize "lineWidth" in canvas settings and i set it to random number between 10 and 20 and i assign it's value inside the draw fractal it will be equal to lineWidth variable. 


*/

