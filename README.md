# Game of life
This is simple implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) - simple cellular automaton. 

This 0-player game consists of an infinite two-dimensional grid, where each cell in current time step can be either dead or alive. 
The rules guiding if a cell should be dead or alive in the next time step are as follows:
1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
2. Any live cell with two or three live neighbours lives on to the next generation.
3. Any live cell with more than three live neighbours dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
