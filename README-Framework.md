# Haus of Confidence Business Backend

### Usage:

When working on files in the **src** directory, run the below command to build the web application:

```bash
yarn buildApp
```

### Development

If you're doing development, it is recommended to use the development server. This will automatically update with any changes you have in the *server* folder

```bash
yarn devServer
```

### Production

Be sure to use the command below whenever a **.ts file** is changed anywhere in the **server** directory. 

```bash
yarn buildServer
```

Alternatively, you can enable automatic builds using the following command. This command works as a production tool -- `git pull` on the server will cause a new build

```bash
yarn autoBuildServer
```

Then use the following command to start the pm2 process:

```bash
yarn production
```

Running this command will create a thread on all available cpu cores. This behavior can be changed by modifying the *process.json* file; details are in the **Configuring the Production Server** section

### Laziness

If you want to clean all build directories and delete all log files, rebuild the app and the server, and start up the production server in one command:

```bash
yarn doEverything
```

 **Nginx** should be used to redirect the HTTP port traffic to the HTTPS port.

### Configure Project Settings

The *.env* file is used to configure the application's ports, email settings, and database settings. The file *.env.template* contains a template of the file and can be simply renamed *.env* if desired. *Any value that expects a true or false can also be omitted entirely (omit variable name or value) from the file to indicate a FALSE value.* 

Below is the expected format of the file: 

- **INTERNAL_SERVER_NAME**: Used only for console logging at the moment  

- **PORT**:  The port to serve HTTP from. Heroku sets this automatically.

- **NO_ROBOTS**: Enables (`true`) or disables(`false`) *robots.txt*.  

- **DATABASE_URL**: (optional) Database connection URL

- **FRONTEND**: (optional) set to `true` to enable the React frontend. 

- **SOCKETS**: (optional) set to `true` to enable Socket.io server

- **VERBOSE**: (optional) set to `true` to have repeating and cron tasks report their statuses to the console

- **DATABASE_URL**:

- **FRONTEND_PASSCODE**

  

- **GRAPHQL**

- **PODIUM_CLIENT_ID**

- **PODIUM_CLIENT_SECRET**

- **PODIUM_REDIRECT_URI**

- **PODIUM_LOCATION_ID**

- **PODIUM_ORGANIZATION_ID**

- **BLVD_SANDBOX**

- **BLVD_API_KEY**

- **BLVD_SECRET_KEY**

- **BLVD_BUSINESS_ID**

------

### **Configuring Routes**

Custom routes can be configured in the **server/routes/routes.ts** file, in the ***customRoutes()*** function. Remember to run `yarn buildServer` whenever modifying this file.

Custom routes are generally discouraged when creating React apps, as they can conflict with React Router. However, if only backend functionality is desired, then using custom routes will not be an issue. In most situations, WebSockets are preferred.

## Configuring the Production Server 

The production server uses PM2, which will automatically restart the application if something goes wrong, and allows you to run the server on as many cores as possible. PM2 is run when using the command `yarn production`

### Options

pm2 uses the file *process.json* for the server configuration. 

- **"instances"**: can be set to *max* to utilize all cores, or set to "(number of cores)" as low as 1 

### Persistence

If you want your application to return after a reboot, start up your production server first, then run the following command:

```bash
pm2 startup
```

You will be given a command to run. Run it, then use this next command:

```bash
pm2 save
```

If you no longer want this to happen, use this command:

```bash
pm2 unstartup
```

Now your application will restart automatically when it crashes, and restart automatically when the computer reboots.



## Contact Sync

After Podium and Boulevard contacts have been imported, the initial contact sync task will run. This task takes a look at all the contacts not synced with their opposing services, and syncs them to those services. This functionality is locked behind a state value, however, that defaults to FALSE. 

To allow contact importing across both services in initial import, the jsonb value for _ _system_ _contact_import 

**allowImport** must be true

