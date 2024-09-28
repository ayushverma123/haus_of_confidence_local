import { AutomatedMessageTimeConfigEntry } from "./AutomatedMessageTimeConfigEntry"
import { TimeDistanceConfiguration } from "./TimeDistance"

export type AutomatedMessageSpecificDateConfigurationEntry = {
    date: AutomatedMessageTimeConfigEntry,
    timeDistance?: TimeDistanceConfiguration
}

/*     Example Object for Every 2 Days starting 12 days before the specified date, ending 12 hours before the specified date
    {
        "date": "2020-01-01",
        "timeDistance": {
            "direction": "forward",
            "distance": {
                "days": 12,
                "hour": 0,
                "minutes": 0,
                "seconds": 0
            },
            "distanceFrom": "specificDate",
            "repeat": true,
            "repeatConfiguration": {
                "days": 2,
                "hour": 0,
                "minutes": 0,
                "seconds": 0
            },
            "endRepeat": {
                "direction": "forward",
                "endTime": {
                    "days": 0,
                    "hour": 12,
                    "minutes": 0,
                    "seconds": 0
                }
            }
        }
    }
*/