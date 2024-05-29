/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { storeApiKeyAsync, storeUnitAsync } from "../settings/settings";

/**
 * Displays the API key dialog.
 * @param event
 */
async function displaySettingsDialog(event: Office.AddinCommands.Event) {
  try {
    const TASKPANE_DOMAIN: string = process.env.NODE_ENV === "production" ? "ToDo" : "localhost:3000";

    Office.context.ui.displayDialogAsync(
      `https://${TASKPANE_DOMAIN}/taskpane.html`,
      {
        height: 49,
        width: 40,
        displayInIframe: true,
      },
      (asyncResult: Office.AsyncResult<Office.Dialog>) => {
        try
        {
          if (!asyncResult) {
            console.error("Unable to process the settings dialog due to an invalid dialog result.");
            return;
          }

          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            console.error(`Unable to process the settings dialog due to an invalid dialog status. Error Code: ${asyncResult.error.code}, Error Message: ${asyncResult.error.message}`);

            return;
          }

          const dialog: Office.Dialog = asyncResult.value;

          if (!dialog) {
            console.error("Unable to process the settings dialog due to an invalid dialog.");
            return;
          }

          dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (args: { message: string; origin: string | undefined; } | { error: number;}) => {
            // if (args) {
            //   const argsAsMessageOrigin = args as { message: string; origin: string | undefined; };

            //   if (argsAsMessageOrigin) {
            //     const json = JSON.parse(argsAsMessageOrigin.message);

            //     if (json.apiKey) {
            //       await storeApiKeyAsync(json.apiKey);
            //     }

            //     if (json.unit) {
            //       await storeUnitAsync(json.unit);
            //     }
            //   }
            // }

            dialog.close();
          });
        }
        catch (e: unknown) {
          console.error(`Unexpected error: ${e}`);
        }
      }
    );
  } 
  catch (e: unknown) {
    console.error(`Unexpected error: ${e}`);
  }
  finally
  {
    if (event) {
      event.completed();
    }
  }
}

Office.actions.associate("displaySettingsDialog", displaySettingsDialog);
