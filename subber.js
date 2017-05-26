chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html',
        {

            'state' : 'normal',
            'bounds' : {
                'width': 800,
                'height': 120,
                'top' : Math.round(window.screen.availHeight - 200),
                'left' : Math.round((window.screen.availWidth - 800) / 2)

            },
            frame: {
                type: "none"
            },
            alwaysOnTop: true,
            resizable: true
        }
    );
});
