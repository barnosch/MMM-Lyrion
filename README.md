## Installation

Navigate to your MagicMirror modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/barnosch/MMM-Lyrion.git
cd MMM-Lyrion
npm install
```

## Configuration

To enable the module, add it to the config.js file in your MagicMirror setup:

```bash
{
    module: "MMM-Lyrion",
    disabled: false,
    position: "bottom_right",                     // Adjust as needed
    config: {
        lmsServer: "http://10.30.10.11:9000"      // IPofyourserver:9000
    }
}
```

Playing\
![Playing](https://github.com/user-attachments/assets/017ef5e2-4557-4e63-af2c-e1c139dd2f2a)

Stopped\
![paused](https://github.com/user-attachments/assets/4d6792fe-e2d9-4fd4-8c8b-c4f87488b4ae)

