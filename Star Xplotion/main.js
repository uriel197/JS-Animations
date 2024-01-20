const canvas = document.getElementById('canvas1');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';

        class Particle {
            constructor(effect) {
                this.effect = effect;
                this.radius = Math.random() * 8 + 2;
                this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
                this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.pushX = 0;
                this.pushY = 0;
                this.friction = 0.95;
            }

            draw(context) {
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                context.fill();
                context.stroke();
            }

            update() {
                if(this.effect.mouse.pressed) {
                    const dx = this.x - this.effect.mouse.x;
                    const dy = this.y - this.effect.mouse.y;
                    const distance = Math.hypot(dx, dy); /* 0 */
                    const force = this.effect.mouse.radius / distance;
                    if(distance < this.effect.mouse.radius) {
                        const angle = Math.atan2(dy, dx);  /* 0.5 */
                        this.pushX += Math.cos(angle) * force;  /* 1 */
                        this.pushY += Math.sin(angle) * force;
                    }
                }

                this.x += (this.pushX *= this.friction) + this.speedX;
                this.y += (this.pushY *= this.friction) + this.speedY;

                if(this.x < this.radius) {
                    this.x = this.radius;
                    this.speedX *= -1;
                } else if(this.x > this.effect.width - this.radius) {
                    this.x = this.effect.width - this.radius;
                    this.speedX *= -1;
                }
                if(this.y < this.radius) {
                    this.y = this.radius;
                    this.speedY *= -1;
                } else if(this.y > this.effect.height - this.radius) {
                    this.y = this.effect.height - this.radius;
                    this.speedY *= -1;
                }
            }

            reset() {  /* 2 */
                this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
                this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
            }
        }

        class Effect {
            constructor(canvas, context) {
                this.canvas = canvas;
                this.context = context;
                this.width = canvas.width;
                this.height = canvas.height;
                this.particles = [];
                this.numberOfParticles = 200;
                this.createParticle();

                this.mouse = {
                    x: 0,
                    y: 0,
                    radius: 100,
                    pressed: false,
                }

                window.addEventListener('mousemove', e => {
                    if(this.mouse.pressed) {
                        this.mouse.x = e.x;
                        this.mouse.y = e.y;
                    }
                })

                window.addEventListener('mousedown', e => {
                    this.mouse.pressed = true;
                    this.mouse.x = e.x;
                    this.mouse.y = e.y;
                })

                window.addEventListener('mouseup', e => {
                    this.mouse.pressed = false;
                })

                window.addEventListener('resize', e => {
                    this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
                })

            }

            createParticle() {
                for(let i = 0; i < this.numberOfParticles; i++) {
                    this.particles.push(new Particle(this));
                }
            }

            handleParticles(context) {
                this.connectDots(context);
                this.particles.forEach(particle => {
                    particle.draw(context);
                    particle.update();

                })
            }

            connectDots(context) {
                const maxDistance = 100;
                for(let a = 0; a < this.particles.length; a++) {
                    for(let b = a; b < this.particles.length; b++) {
                        const dx = this.particles[a].x - this.particles[b].x;
                        const dy = this.particles[a].y - this.particles[b].y;
                        const distance = Math.hypot(dx, dy);
                        if(distance < maxDistance) {
                            const opacity = 1 - distance / maxDistance;
                            context.save();
                            context.beginPath();
                            context.globalAlpha = opacity;
                            context.moveTo(this.particles[a].x, this.particles[a].y);
                            context.lineTo(this.particles[b].x, this.particles[b].y);
                            context.stroke();
                            context.restore();
                        }
                    }
                }
            }

            resize(width, height) {  /* 2 */
                this.canvas.width = width;
                this.canvas.height = height;
                this.width = width;
                this.height = height;
                this.context.strokeStyle = 'white';
                this.particles.forEach(particle => particle.reset());

            }
        }
        const effect = new Effect(canvas, ctx);

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            effect.handleParticles(ctx);
            requestAnimationFrame(animate);
        }

        animate();


/********** Comments **********

*** 0:  dx calculates the horizontal difference between this.x - this.effect.mouse.x and that forms the botom vector of the right triangle, then dy calculates the vertical difference between this.y - this.effect.mouse.y which forms the vertical vector of the right triangle. distance is the 3rd vector which closes the triangle. this is obtained by calculating the Euclidean distance between these two points using the formula Math.hypot(x, y).

*** 0.5:  Math.atan2() calculates the angle formed by the positive x-axis and the distance vector in radians. in the given code, the position of the mouse (this.effect.mouse.x and this.effect.mouse.y) is used to calculate the angle between each particle and the mouse position. The point of origin, in this case, is the current position of the particle (this.x and this.y).
The angle is calculated using the Math.atan2(dy, dx) function, where dx represents the difference between the particle's x-coordinate and the mouse's x-coordinate, and dy represents the difference between the particle's y-coordinate and the mouse's y-coordinate. This calculates the angle between the particle and the mouse position relative to the positive x-axis.
Then, the Math.cos(angle) and Math.sin(angle) functions are used to determine the direction of the force that will be applied to the particle, based on the angle calculated. The force is then added to the pushX and pushY variables to simulate the effect of pushing the particles away from the mouse position.

** 1:  I will need two separate speed values, basically, speedX and speedY, horizontal and vertical velocity values create the bouncing ball motion that flips when particles hit the edges of canvas area I don't want to be interfering with how that works so I create a separate set of variables for a speed of horizontal and vertical push, pushX and pushY. the force of this push will be determined by how far the particle is from the mouse when we click or when we move the mouse around. now we have two forces influencing particle motion, the bounce in motion from speedX and speedY and mouse push force from pushX and pushY properties. right now particles just bounce around because of speedX and speedY and whenever we click the mouse pushX and pushY kick in adding to speedX and speedY in lines 53 and 54

** 2: I create a custom method I call resize(). it will take the new width and height as arguments. when the resize event fires I need to update width and height of the Effect class to the new sizes then I set width and height properties we have on our effect class to these new updated values which is why we must declare the "resize" eventListener inside Effect. we know that when an instance of a class is created all the code inside is executed, the resize eventListener is code that I want to run at the point when Effect is created. we are already doing that with createParticles(). an important thing is to either bind this callback function or I can use es6 Arrow function in here, using a regular callback function will give us an error if we plan to use the "this" keyword inside this event listener. I want "this" keyword to point to this effect object, es6 Arrow functions were created to simplify function scope and one of their special features is that they automatically inherit the "this" keyword from the parent scope which is exactly what we need here. I will console log the event object and when I resize my browser window event is firing and we can see the object here inside which contains the new updated width and height, we access it like this e.target.window.InnerWidth and height. now when I resize we can see it's updating, I know that our custom resize() method expects width and height so when I call it here (line 113) I pass it the new updated with and the new updated height. one thing we have to remember when working with canvas is that resize event resets canvas state to default values so I have to redeclare strokeStyle inside resize() every time it runs, we are inside of a class so I want to use this.context instead of ctx (line 160) and I guess it will be expected here in the Constructor as well (line 165) and also inside the constructor (in line 79) also it will be converted inside the contructor to a class property (line 81)
every time resize method runs I will run a custom reset() method on particle class which will redistribute them only within the newly available area making sure that no particles get stuck outside the canvas. I only run this after we resized and updated all properties for each particle object (line 161) inside particles array, call the custom reset method we just defined and when we resize canvas, particles always reset to fit into the newly available larger or smaller effect area. remember that canvas State always resets to default when canvas is resized which includes fill style and stroke style resetting to the default black color that's why we have to redeclare our colors inside our custom resize event.
*/
