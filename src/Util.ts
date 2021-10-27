interface Color {
    red: number;
    green: number;
    blue: number;
}

const colorGradient = (fadeFraction: number, rgbColor1: Color, rgbColor2: Color, rgbColor3: Color): string => {
    let color1 = rgbColor1;
    let color2 = rgbColor2;
    let fade = fadeFraction;

    // Do we have 3 colors for the gradient? Need to adjust the params.
    if (rgbColor3) {
        fade = fade * 2;

        // Find which interval to use and adjust the fade percentage
        if (fade >= 1) {
            fade -= 1;
            color1 = rgbColor2;
            color2 = rgbColor3;
        }
    }

    const diffRed = color2.red - color1.red;
    const diffGreen = color2.green - color1.green;
    const diffBlue = color2.blue - color1.blue;

    const gradient = {
        red: parseInt(String(Math.floor(color1.red + diffRed * fade)), 10),
        green: parseInt(String(Math.floor(color1.green + diffGreen * fade)), 10),
        blue: parseInt(String(Math.floor(color1.blue + diffBlue * fade)), 10),
    };

    return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
};

export const getColor = (weight: number) =>
    colorGradient(
        weight,
        { red: 224, green: 224, blue: 224 },
        { red: 255, green: 255, blue: 0 },
        { red: 153, green: 0, blue: 0 },
    );
