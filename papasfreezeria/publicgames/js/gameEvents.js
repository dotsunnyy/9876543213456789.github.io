function cmgGameEvent(e, t) {
    if ("function" == typeof parent.cmgGameEvent && parent != this)
        try {
            parent.cmgGameEvent(e, t)
        } catch (e) {
            console.log("cmgGameEvent failed in parent")
        }
    else
        gDate = new Date,
        console.log("cmgGameEvent: event=" + e + " | level=" + t + " Time: " + gDate + " Timestamp: " + gDate.getTime())
}