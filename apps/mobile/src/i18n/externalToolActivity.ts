import type { useGT } from "gt-react-native";

type Translate = ReturnType<typeof useGT>;

const CHANGE_REQUEST_TARGET = /^(.+) (PR|MR|change request) #(\d+)$/;
const FAILED_GUIDES = /^(.+), (\d+) failed$/;

/**
 * Labels that work-log presentation builds for T3 tools (t3McpToolPresentation, t3ToolSummary).
 * Counts other than a bare 1 are matched as `{n}`, so each case is one full source sentence.
 */
export function localizeToolActivity(message: string, gt: Translate): string | undefined {
  const target = CHANGE_REQUEST_TARGET.exec(message);
  if (target) {
    return changeRequestTargetLabel(
      target[1]!,
      { changeRequest: target[2]!, number: target[3]! },
      gt,
    );
  }
  const failed = FAILED_GUIDES.exec(message);
  if (failed) {
    const label = localizeToolActivity(failed[1]!, gt);
    return label === undefined
      ? undefined
      : gt("{label}, {count} failed", { label, count: failed[2]! });
  }
  const counts: string[] = [];
  const shape = message.replace(/\b\d+\b/g, (count) => {
    if (count === "1") return count;
    counts.push(count);
    return "{n}";
  });
  return toolActivityLabel(shape, counts, gt);
}

function changeRequestTargetLabel(
  verb: string,
  values: { changeRequest: string; number: string },
  gt: Translate,
): string | undefined {
  switch (verb) {
    case "Linked":
      return gt("Linked {changeRequest} #{number}", values);
    case "Linking":
      return gt("Linking {changeRequest} #{number}", values);
    case "Failed to link":
      return gt("Failed to link {changeRequest} #{number}", values);
    case "Declined to link":
      return gt("Declined to link {changeRequest} #{number}", values);
    case "Stopped linking":
      return gt("Stopped linking {changeRequest} #{number}", values);
    case "Unlinked":
      return gt("Unlinked {changeRequest} #{number}", values);
    case "Unlinking":
      return gt("Unlinking {changeRequest} #{number}", values);
    case "Failed to unlink":
      return gt("Failed to unlink {changeRequest} #{number}", values);
    case "Declined to unlink":
      return gt("Declined to unlink {changeRequest} #{number}", values);
    case "Stopped unlinking":
      return gt("Stopped unlinking {changeRequest} #{number}", values);
    case "Watching":
      return gt("Watching {changeRequest} #{number}", values);
    case "Failed to watch":
      return gt("Failed to watch {changeRequest} #{number}", values);
    case "Declined to watch":
      return gt("Declined to watch {changeRequest} #{number}", values);
    case "Stopped watching":
      return gt("Stopped watching {changeRequest} #{number}", values);
    case "Unwatching":
      return gt("Unwatching {changeRequest} #{number}", values);
    case "Failed to stop watching":
      return gt("Failed to stop watching {changeRequest} #{number}", values);
    case "Declined to stop watching":
      return gt("Declined to stop watching {changeRequest} #{number}", values);
    case "Stopped unwatching":
      return gt("Stopped unwatching {changeRequest} #{number}", values);
    default:
      return undefined;
  }
}

function toolActivityLabel(shape: string, n: string[], gt: Translate): string | undefined {
  switch (shape) {
    case "Linked a pull request":
      return gt("Linked a pull request");
    case "Linking a pull request":
      return gt("Linking a pull request");
    case "Failed to link a pull request":
      return gt("Failed to link a pull request");
    case "Declined to link a pull request":
      return gt("Declined to link a pull request");
    case "Stopped linking a pull request":
      return gt("Stopped linking a pull request");
    case "Link a pull request":
      return gt("Link a pull request");
    case "Linked pull requests":
      return gt("Linked pull requests");
    case "Linking pull requests":
      return gt("Linking pull requests");
    case "Failed to link pull requests":
      return gt("Failed to link pull requests");
    case "Declined to link pull requests":
      return gt("Declined to link pull requests");
    case "Stopped linking pull requests":
      return gt("Stopped linking pull requests");
    case "Link pull requests":
      return gt("Link pull requests");
    case "Unlinked a pull request":
      return gt("Unlinked a pull request");
    case "Unlinking a pull request":
      return gt("Unlinking a pull request");
    case "Failed to unlink a pull request":
      return gt("Failed to unlink a pull request");
    case "Declined to unlink a pull request":
      return gt("Declined to unlink a pull request");
    case "Stopped unlinking a pull request":
      return gt("Stopped unlinking a pull request");
    case "Unlink a pull request":
      return gt("Unlink a pull request");
    case "Unlinked pull requests by state":
      return gt("Unlinked pull requests by state");
    case "Unlinking pull requests by state":
      return gt("Unlinking pull requests by state");
    case "Failed to unlink pull requests by state":
      return gt("Failed to unlink pull requests by state");
    case "Declined to unlink pull requests by state":
      return gt("Declined to unlink pull requests by state");
    case "Stopped unlinking pull requests by state":
      return gt("Stopped unlinking pull requests by state");
    case "Unlink pull requests by state":
      return gt("Unlink pull requests by state");
    case "Checking linked pull requests":
      return gt("Checking linked pull requests");
    case "Failed to check linked pull requests":
      return gt("Failed to check linked pull requests");
    case "Declined to check linked pull requests":
      return gt("Declined to check linked pull requests");
    case "Stopped checking linked pull requests":
      return gt("Stopped checking linked pull requests");
    case "Check linked pull requests":
      return gt("Check linked pull requests");
    case "Watching a pull request":
      return gt("Watching a pull request");
    case "Failed to watch a pull request":
      return gt("Failed to watch a pull request");
    case "Declined to watch a pull request":
      return gt("Declined to watch a pull request");
    case "Stopped watching a pull request":
      return gt("Stopped watching a pull request");
    case "Watch a pull request":
      return gt("Watch a pull request");
    case "Unwatching a pull request":
      return gt("Unwatching a pull request");
    case "Failed to stop watching a pull request":
      return gt("Failed to stop watching a pull request");
    case "Declined to stop watching a pull request":
      return gt("Declined to stop watching a pull request");
    case "Stopped unwatching a pull request":
      return gt("Stopped unwatching a pull request");
    case "Stop watching a pull request":
      return gt("Stop watching a pull request");
    case "Started writing review guides":
      return gt("Started writing review guides");
    case "Writing review guides":
      return gt("Writing review guides");
    case "Failed to write review guides":
      return gt("Failed to write review guides");
    case "Declined to write review guides":
      return gt("Declined to write review guides");
    case "Stopped writing review guides":
      return gt("Stopped writing review guides");
    case "Write review guides":
      return gt("Write review guides");
    case "Read a review guide":
      return gt("Read a review guide");
    case "Reading a review guide":
      return gt("Reading a review guide");
    case "Failed to read a review guide":
      return gt("Failed to read a review guide");
    case "Declined to read a review guide":
      return gt("Declined to read a review guide");
    case "Stopped reading a review guide":
      return gt("Stopped reading a review guide");
    case "Got orchestration capabilities":
      return gt("Got orchestration capabilities");
    case "Getting orchestration capabilities":
      return gt("Getting orchestration capabilities");
    case "Failed to get orchestration capabilities":
      return gt("Failed to get orchestration capabilities");
    case "Declined to get orchestration capabilities":
      return gt("Declined to get orchestration capabilities");
    case "Stopped getting orchestration capabilities":
      return gt("Stopped getting orchestration capabilities");
    case "Get orchestration capabilities":
      return gt("Get orchestration capabilities");
    case "Delegated a child task":
      return gt("Delegated a child task");
    case "Delegating a child task":
      return gt("Delegating a child task");
    case "Failed to delegate a child task":
      return gt("Failed to delegate a child task");
    case "Declined to delegate a child task":
      return gt("Declined to delegate a child task");
    case "Stopped delegating a child task":
      return gt("Stopped delegating a child task");
    case "Delegate a child task":
      return gt("Delegate a child task");
    case "Got delegated task status":
      return gt("Got delegated task status");
    case "Getting delegated task status":
      return gt("Getting delegated task status");
    case "Failed to get delegated task status":
      return gt("Failed to get delegated task status");
    case "Declined to get delegated task status":
      return gt("Declined to get delegated task status");
    case "Stopped getting delegated task status":
      return gt("Stopped getting delegated task status");
    case "Get delegated task status":
      return gt("Get delegated task status");
    case "Requested cancellation of a delegated task":
      return gt("Requested cancellation of a delegated task");
    case "Canceling a delegated task":
      return gt("Canceling a delegated task");
    case "Failed to cancel a delegated task":
      return gt("Failed to cancel a delegated task");
    case "Declined to cancel a delegated task":
      return gt("Declined to cancel a delegated task");
    case "Stopped canceling a delegated task":
      return gt("Stopped canceling a delegated task");
    case "Cancel a delegated task":
      return gt("Cancel a delegated task");
    case "Scheduled a task":
      return gt("Scheduled a task");
    case "Scheduling a task":
      return gt("Scheduling a task");
    case "Failed to schedule a task":
      return gt("Failed to schedule a task");
    case "Declined to schedule a task":
      return gt("Declined to schedule a task");
    case "Stopped scheduling a task":
      return gt("Stopped scheduling a task");
    case "Schedule a task":
      return gt("Schedule a task");
    case "Listed scheduled tasks":
      return gt("Listed scheduled tasks");
    case "Listing scheduled tasks":
      return gt("Listing scheduled tasks");
    case "Failed to list scheduled tasks":
      return gt("Failed to list scheduled tasks");
    case "Declined to list scheduled tasks":
      return gt("Declined to list scheduled tasks");
    case "Stopped listing scheduled tasks":
      return gt("Stopped listing scheduled tasks");
    case "List scheduled tasks":
      return gt("List scheduled tasks");
    case "Updated a scheduled task":
      return gt("Updated a scheduled task");
    case "Updating a scheduled task":
      return gt("Updating a scheduled task");
    case "Failed to update a scheduled task":
      return gt("Failed to update a scheduled task");
    case "Declined to update a scheduled task":
      return gt("Declined to update a scheduled task");
    case "Stopped updating a scheduled task":
      return gt("Stopped updating a scheduled task");
    case "Update a scheduled task":
      return gt("Update a scheduled task");
    case "Requested deletion of a scheduled task":
      return gt("Requested deletion of a scheduled task");
    case "Deleting a scheduled task":
      return gt("Deleting a scheduled task");
    case "Failed to delete a scheduled task":
      return gt("Failed to delete a scheduled task");
    case "Declined to delete a scheduled task":
      return gt("Declined to delete a scheduled task");
    case "Stopped deleting a scheduled task":
      return gt("Stopped deleting a scheduled task");
    case "Delete a scheduled task":
      return gt("Delete a scheduled task");
    case "Asked for a secret":
      return gt("Asked for a secret");
    case "Asking for a secret":
      return gt("Asking for a secret");
    case "Failed to ask for a secret":
      return gt("Failed to ask for a secret");
    case "Declined to ask for a secret":
      return gt("Declined to ask for a secret");
    case "Stopped asking for a secret":
      return gt("Stopped asking for a secret");
    case "Ask for a secret":
      return gt("Ask for a secret");
    case "Created T3 threads":
      return gt("Created T3 threads");
    case "Creating T3 threads":
      return gt("Creating T3 threads");
    case "Failed to create T3 threads":
      return gt("Failed to create T3 threads");
    case "Declined to create T3 threads":
      return gt("Declined to create T3 threads");
    case "Stopped creating T3 threads":
      return gt("Stopped creating T3 threads");
    case "Create T3 threads":
      return gt("Create T3 threads");
    case "Started a T3 thread":
      return gt("Started a T3 thread");
    case "Starting a T3 thread":
      return gt("Starting a T3 thread");
    case "Failed to start a T3 thread":
      return gt("Failed to start a T3 thread");
    case "Declined to start a T3 thread":
      return gt("Declined to start a T3 thread");
    case "Stopped starting a T3 thread":
      return gt("Stopped starting a T3 thread");
    case "Start a T3 thread":
      return gt("Start a T3 thread");
    case "Listed T3 threads":
      return gt("Listed T3 threads");
    case "Listing T3 threads":
      return gt("Listing T3 threads");
    case "Failed to list T3 threads":
      return gt("Failed to list T3 threads");
    case "Declined to list T3 threads":
      return gt("Declined to list T3 threads");
    case "Stopped listing T3 threads":
      return gt("Stopped listing T3 threads");
    case "List T3 threads":
      return gt("List T3 threads");
    case "Read a T3 thread":
      return gt("Read a T3 thread");
    case "Reading a T3 thread":
      return gt("Reading a T3 thread");
    case "Failed to read a T3 thread":
      return gt("Failed to read a T3 thread");
    case "Declined to read a T3 thread":
      return gt("Declined to read a T3 thread");
    case "Stopped reading a T3 thread":
      return gt("Stopped reading a T3 thread");
    case "Sent to a T3 thread":
      return gt("Sent to a T3 thread");
    case "Sending to a T3 thread":
      return gt("Sending to a T3 thread");
    case "Failed to send to a T3 thread":
      return gt("Failed to send to a T3 thread");
    case "Declined to send to a T3 thread":
      return gt("Declined to send to a T3 thread");
    case "Stopped sending to a T3 thread":
      return gt("Stopped sending to a T3 thread");
    case "Send to a T3 thread":
      return gt("Send to a T3 thread");
    case "Waited for a T3 thread":
      return gt("Waited for a T3 thread");
    case "Waiting for a T3 thread":
      return gt("Waiting for a T3 thread");
    case "Failed to wait for a T3 thread":
      return gt("Failed to wait for a T3 thread");
    case "Declined to wait for a T3 thread":
      return gt("Declined to wait for a T3 thread");
    case "Stopped waiting for a T3 thread":
      return gt("Stopped waiting for a T3 thread");
    case "Wait for a T3 thread":
      return gt("Wait for a T3 thread");
    case "Requested a stop for a workflow":
      return gt("Requested a stop for a workflow");
    case "Stopping a workflow":
      return gt("Stopping a workflow");
    case "Failed to stop a workflow":
      return gt("Failed to stop a workflow");
    case "Declined to stop a workflow":
      return gt("Declined to stop a workflow");
    case "Stopped stopping a workflow":
      return gt("Stopped stopping a workflow");
    case "Stop a workflow":
      return gt("Stop a workflow");
    case "Updated background waits":
      return gt("Updated background waits");
    case "Updating background waits":
      return gt("Updating background waits");
    case "Failed to update background waits":
      return gt("Failed to update background waits");
    case "Declined to update background waits":
      return gt("Declined to update background waits");
    case "Stopped updating background waits":
      return gt("Stopped updating background waits");
    case "Update background waits":
      return gt("Update background waits");
    case "Requested an interrupt of a T3 thread":
      return gt("Requested an interrupt of a T3 thread");
    case "Interrupting a T3 thread":
      return gt("Interrupting a T3 thread");
    case "Failed to interrupt a T3 thread":
      return gt("Failed to interrupt a T3 thread");
    case "Declined to interrupt a T3 thread":
      return gt("Declined to interrupt a T3 thread");
    case "Stopped interrupting a T3 thread":
      return gt("Stopped interrupting a T3 thread");
    case "Interrupt a T3 thread":
      return gt("Interrupt a T3 thread");
    case "Handed off thread to a git worktree":
      return gt("Handed off thread to a git worktree");
    case "Handing off thread to a git worktree":
      return gt("Handing off thread to a git worktree");
    case "Failed to hand off thread to a git worktree":
      return gt("Failed to hand off thread to a git worktree");
    case "Declined to hand off thread to a git worktree":
      return gt("Declined to hand off thread to a git worktree");
    case "Stopped handing off thread to a git worktree":
      return gt("Stopped handing off thread to a git worktree");
    case "Hand off thread to a git worktree":
      return gt("Hand off thread to a git worktree");
    case "Got thread worktree status":
      return gt("Got thread worktree status");
    case "Getting thread worktree status":
      return gt("Getting thread worktree status");
    case "Failed to get thread worktree status":
      return gt("Failed to get thread worktree status");
    case "Declined to get thread worktree status":
      return gt("Declined to get thread worktree status");
    case "Stopped getting thread worktree status":
      return gt("Stopped getting thread worktree status");
    case "Get thread worktree status":
      return gt("Get thread worktree status");
    case "Got preview browser status":
      return gt("Got preview browser status");
    case "Getting preview browser status":
      return gt("Getting preview browser status");
    case "Failed to get preview browser status":
      return gt("Failed to get preview browser status");
    case "Declined to get preview browser status":
      return gt("Declined to get preview browser status");
    case "Stopped getting preview browser status":
      return gt("Stopped getting preview browser status");
    case "Get preview browser status":
      return gt("Get preview browser status");
    case "Opened a page in the preview browser":
      return gt("Opened a page in the preview browser");
    case "Opening a page in the preview browser":
      return gt("Opening a page in the preview browser");
    case "Failed to open a page in the preview browser":
      return gt("Failed to open a page in the preview browser");
    case "Declined to open a page in the preview browser":
      return gt("Declined to open a page in the preview browser");
    case "Stopped opening a page in the preview browser":
      return gt("Stopped opening a page in the preview browser");
    case "Open a page in the preview browser":
      return gt("Open a page in the preview browser");
    case "Navigated the preview browser":
      return gt("Navigated the preview browser");
    case "Navigating the preview browser":
      return gt("Navigating the preview browser");
    case "Failed to navigate the preview browser":
      return gt("Failed to navigate the preview browser");
    case "Declined to navigate the preview browser":
      return gt("Declined to navigate the preview browser");
    case "Stopped navigating the preview browser":
      return gt("Stopped navigating the preview browser");
    case "Navigate the preview browser":
      return gt("Navigate the preview browser");
    case "Responded to a preview browser dialog":
      return gt("Responded to a preview browser dialog");
    case "Responding to a preview browser dialog":
      return gt("Responding to a preview browser dialog");
    case "Failed to respond to a preview browser dialog":
      return gt("Failed to respond to a preview browser dialog");
    case "Declined to respond to a preview browser dialog":
      return gt("Declined to respond to a preview browser dialog");
    case "Stopped responding to a preview browser dialog":
      return gt("Stopped responding to a preview browser dialog");
    case "Respond to a preview browser dialog":
      return gt("Respond to a preview browser dialog");
    case "Took a snapshot of the preview page":
      return gt("Took a snapshot of the preview page");
    case "Taking a snapshot of the preview page":
      return gt("Taking a snapshot of the preview page");
    case "Failed to take a snapshot of the preview page":
      return gt("Failed to take a snapshot of the preview page");
    case "Declined to take a snapshot of the preview page":
      return gt("Declined to take a snapshot of the preview page");
    case "Stopped taking a snapshot of the preview page":
      return gt("Stopped taking a snapshot of the preview page");
    case "Snapshot the preview page":
      return gt("Snapshot the preview page");
    case "Used the preview browser":
      return gt("Used the preview browser");
    case "Using the preview browser":
      return gt("Using the preview browser");
    case "Failed to use the preview browser":
      return gt("Failed to use the preview browser");
    case "Declined to use the preview browser":
      return gt("Declined to use the preview browser");
    case "Stopped using the preview browser":
      return gt("Stopped using the preview browser");
    case "Use the preview browser":
      return gt("Use the preview browser");
    case "Clicked in the preview browser":
      return gt("Clicked in the preview browser");
    case "Clicking in the preview browser":
      return gt("Clicking in the preview browser");
    case "Failed to click in the preview browser":
      return gt("Failed to click in the preview browser");
    case "Declined to click in the preview browser":
      return gt("Declined to click in the preview browser");
    case "Stopped clicking in the preview browser":
      return gt("Stopped clicking in the preview browser");
    case "Click in the preview browser":
      return gt("Click in the preview browser");
    case "Pressed a key in the preview browser":
      return gt("Pressed a key in the preview browser");
    case "Pressing a key in the preview browser":
      return gt("Pressing a key in the preview browser");
    case "Failed to press a key in the preview browser":
      return gt("Failed to press a key in the preview browser");
    case "Declined to press a key in the preview browser":
      return gt("Declined to press a key in the preview browser");
    case "Stopped pressing a key in the preview browser":
      return gt("Stopped pressing a key in the preview browser");
    case "Press a key in the preview browser":
      return gt("Press a key in the preview browser");
    case "Typed in the preview browser":
      return gt("Typed in the preview browser");
    case "Typing in the preview browser":
      return gt("Typing in the preview browser");
    case "Failed to type in the preview browser":
      return gt("Failed to type in the preview browser");
    case "Declined to type in the preview browser":
      return gt("Declined to type in the preview browser");
    case "Stopped typing in the preview browser":
      return gt("Stopped typing in the preview browser");
    case "Type in the preview browser":
      return gt("Type in the preview browser");
    case "Hovered in the preview browser":
      return gt("Hovered in the preview browser");
    case "Hovering in the preview browser":
      return gt("Hovering in the preview browser");
    case "Failed to hover in the preview browser":
      return gt("Failed to hover in the preview browser");
    case "Declined to hover in the preview browser":
      return gt("Declined to hover in the preview browser");
    case "Stopped hovering in the preview browser":
      return gt("Stopped hovering in the preview browser");
    case "Hover in the preview browser":
      return gt("Hover in the preview browser");
    case "Chose an option in the preview browser":
      return gt("Chose an option in the preview browser");
    case "Choosing an option in the preview browser":
      return gt("Choosing an option in the preview browser");
    case "Failed to choose an option in the preview browser":
      return gt("Failed to choose an option in the preview browser");
    case "Declined to choose an option in the preview browser":
      return gt("Declined to choose an option in the preview browser");
    case "Stopped choosing an option in the preview browser":
      return gt("Stopped choosing an option in the preview browser");
    case "Choose an option in the preview browser":
      return gt("Choose an option in the preview browser");
    case "Dragged in the preview browser":
      return gt("Dragged in the preview browser");
    case "Dragging in the preview browser":
      return gt("Dragging in the preview browser");
    case "Failed to drag in the preview browser":
      return gt("Failed to drag in the preview browser");
    case "Declined to drag in the preview browser":
      return gt("Declined to drag in the preview browser");
    case "Stopped dragging in the preview browser":
      return gt("Stopped dragging in the preview browser");
    case "Drag in the preview browser":
      return gt("Drag in the preview browser");
    case "Uploaded files to the preview browser":
      return gt("Uploaded files to the preview browser");
    case "Uploading files to the preview browser":
      return gt("Uploading files to the preview browser");
    case "Failed to upload files to the preview browser":
      return gt("Failed to upload files to the preview browser");
    case "Declined to upload files to the preview browser":
      return gt("Declined to upload files to the preview browser");
    case "Stopped uploading files to the preview browser":
      return gt("Stopped uploading files to the preview browser");
    case "Upload files to the preview browser":
      return gt("Upload files to the preview browser");
    case "Scrolled the preview browser":
      return gt("Scrolled the preview browser");
    case "Scrolling the preview browser":
      return gt("Scrolling the preview browser");
    case "Failed to scroll the preview browser":
      return gt("Failed to scroll the preview browser");
    case "Declined to scroll the preview browser":
      return gt("Declined to scroll the preview browser");
    case "Stopped scrolling the preview browser":
      return gt("Stopped scrolling the preview browser");
    case "Scroll the preview browser":
      return gt("Scroll the preview browser");
    case "Resized the preview browser":
      return gt("Resized the preview browser");
    case "Resizing the preview browser":
      return gt("Resizing the preview browser");
    case "Failed to resize the preview browser":
      return gt("Failed to resize the preview browser");
    case "Declined to resize the preview browser":
      return gt("Declined to resize the preview browser");
    case "Stopped resizing the preview browser":
      return gt("Stopped resizing the preview browser");
    case "Resize the preview browser":
      return gt("Resize the preview browser");
    case "Evaluated script in the preview browser":
      return gt("Evaluated script in the preview browser");
    case "Evaluating script in the preview browser":
      return gt("Evaluating script in the preview browser");
    case "Failed to evaluate script in the preview browser":
      return gt("Failed to evaluate script in the preview browser");
    case "Declined to evaluate script in the preview browser":
      return gt("Declined to evaluate script in the preview browser");
    case "Stopped evaluating script in the preview browser":
      return gt("Stopped evaluating script in the preview browser");
    case "Evaluate script in the preview browser":
      return gt("Evaluate script in the preview browser");
    case "Waited for the preview page":
      return gt("Waited for the preview page");
    case "Waiting for the preview page":
      return gt("Waiting for the preview page");
    case "Failed to wait for the preview page":
      return gt("Failed to wait for the preview page");
    case "Declined to wait for the preview page":
      return gt("Declined to wait for the preview page");
    case "Stopped waiting for the preview page":
      return gt("Stopped waiting for the preview page");
    case "Wait for the preview page":
      return gt("Wait for the preview page");
    case "Set preview browser appearance":
      return gt("Set preview browser appearance");
    case "Setting preview browser appearance":
      return gt("Setting preview browser appearance");
    case "Failed to set preview browser appearance":
      return gt("Failed to set preview browser appearance");
    case "Declined to set preview browser appearance":
      return gt("Declined to set preview browser appearance");
    case "Stopped setting preview browser appearance":
      return gt("Stopped setting preview browser appearance");
    case "Started recording the preview browser":
      return gt("Started recording the preview browser");
    case "Starting recording the preview browser":
      return gt("Starting recording the preview browser");
    case "Failed to start recording the preview browser":
      return gt("Failed to start recording the preview browser");
    case "Declined to start recording the preview browser":
      return gt("Declined to start recording the preview browser");
    case "Stopped starting recording the preview browser":
      return gt("Stopped starting recording the preview browser");
    case "Start recording the preview browser":
      return gt("Start recording the preview browser");
    case "Stopped recording the preview browser":
      return gt("Stopped recording the preview browser");
    case "Stopping recording the preview browser":
      return gt("Stopping recording the preview browser");
    case "Failed to stop recording the preview browser":
      return gt("Failed to stop recording the preview browser");
    case "Declined to stop recording the preview browser":
      return gt("Declined to stop recording the preview browser");
    case "Stopped stopping recording the preview browser":
      return gt("Stopped stopping recording the preview browser");
    case "Stop recording the preview browser":
      return gt("Stop recording the preview browser");
    case "Listed simulators and emulators":
      return gt("Listed simulators and emulators");
    case "Listing simulators and emulators":
      return gt("Listing simulators and emulators");
    case "Failed to list simulators and emulators":
      return gt("Failed to list simulators and emulators");
    case "Declined to list simulators and emulators":
      return gt("Declined to list simulators and emulators");
    case "Stopped listing simulators and emulators":
      return gt("Stopped listing simulators and emulators");
    case "List simulators and emulators":
      return gt("List simulators and emulators");
    case "Opened a device in the Device panel":
      return gt("Opened a device in the Device panel");
    case "Opening a device in the Device panel":
      return gt("Opening a device in the Device panel");
    case "Failed to open a device in the Device panel":
      return gt("Failed to open a device in the Device panel");
    case "Declined to open a device in the Device panel":
      return gt("Declined to open a device in the Device panel");
    case "Stopped opening a device in the Device panel":
      return gt("Stopped opening a device in the Device panel");
    case "Open a device in the Device panel":
      return gt("Open a device in the Device panel");
    case "Took a screenshot of the device":
      return gt("Took a screenshot of the device");
    case "Taking a screenshot of the device":
      return gt("Taking a screenshot of the device");
    case "Failed to take a screenshot of the device":
      return gt("Failed to take a screenshot of the device");
    case "Declined to take a screenshot of the device":
      return gt("Declined to take a screenshot of the device");
    case "Stopped taking a screenshot of the device":
      return gt("Stopped taking a screenshot of the device");
    case "Take a screenshot of the device":
      return gt("Take a screenshot of the device");
    case "Closed a device":
      return gt("Closed a device");
    case "Closing a device":
      return gt("Closing a device");
    case "Failed to close a device":
      return gt("Failed to close a device");
    case "Declined to close a device":
      return gt("Declined to close a device");
    case "Stopped closing a device":
      return gt("Stopped closing a device");
    case "Close a device":
      return gt("Close a device");
    case "Requested a run of a scheduled task":
      return gt("Requested a run of a scheduled task");
    case "Running a scheduled task":
      return gt("Running a scheduled task");
    case "Failed to run a scheduled task":
      return gt("Failed to run a scheduled task");
    case "Declined to run a scheduled task":
      return gt("Declined to run a scheduled task");
    case "Stopped running a scheduled task":
      return gt("Stopped running a scheduled task");
    case "Run a scheduled task":
      return gt("Run a scheduled task");
    case "Managed queued messages":
      return gt("Managed queued messages");
    case "Managing queued messages":
      return gt("Managing queued messages");
    case "Failed to manage queued messages":
      return gt("Failed to manage queued messages");
    case "Declined to manage queued messages":
      return gt("Declined to manage queued messages");
    case "Stopped managing queued messages":
      return gt("Stopped managing queued messages");
    case "Manage queued messages":
      return gt("Manage queued messages");
    case "Handled pending questions":
      return gt("Handled pending questions");
    case "Handling pending questions":
      return gt("Handling pending questions");
    case "Failed to handle pending questions":
      return gt("Failed to handle pending questions");
    case "Declined to handle pending questions":
      return gt("Declined to handle pending questions");
    case "Stopped handling pending questions":
      return gt("Stopped handling pending questions");
    case "Handle pending questions":
      return gt("Handle pending questions");
    case "Listed queued messages":
      return gt("Listed queued messages");
    case "Listing queued messages":
      return gt("Listing queued messages");
    case "Failed to list queued messages":
      return gt("Failed to list queued messages");
    case "Declined to list queued messages":
      return gt("Declined to list queued messages");
    case "Stopped listing queued messages":
      return gt("Stopped listing queued messages");
    case "List queued messages":
      return gt("List queued messages");
    case "Read a queued message":
      return gt("Read a queued message");
    case "Reading a queued message":
      return gt("Reading a queued message");
    case "Failed to read a queued message":
      return gt("Failed to read a queued message");
    case "Declined to read a queued message":
      return gt("Declined to read a queued message");
    case "Stopped reading a queued message":
      return gt("Stopped reading a queued message");
    case "Edited a queued message":
      return gt("Edited a queued message");
    case "Editing a queued message":
      return gt("Editing a queued message");
    case "Failed to edit a queued message":
      return gt("Failed to edit a queued message");
    case "Declined to edit a queued message":
      return gt("Declined to edit a queued message");
    case "Stopped editing a queued message":
      return gt("Stopped editing a queued message");
    case "Edit a queued message":
      return gt("Edit a queued message");
    case "Requested cancellation of a queued run":
      return gt("Requested cancellation of a queued run");
    case "Canceling a queued run":
      return gt("Canceling a queued run");
    case "Failed to cancel a queued run":
      return gt("Failed to cancel a queued run");
    case "Declined to cancel a queued run":
      return gt("Declined to cancel a queued run");
    case "Stopped canceling a queued run":
      return gt("Stopped canceling a queued run");
    case "Cancel a queued run":
      return gt("Cancel a queued run");
    case "Reordered a queued run":
      return gt("Reordered a queued run");
    case "Reordering a queued run":
      return gt("Reordering a queued run");
    case "Failed to reorder a queued run":
      return gt("Failed to reorder a queued run");
    case "Declined to reorder a queued run":
      return gt("Declined to reorder a queued run");
    case "Stopped reordering a queued run":
      return gt("Stopped reordering a queued run");
    case "Reorder a queued run":
      return gt("Reorder a queued run");
    case "Requested steering with a queued message":
      return gt("Requested steering with a queued message");
    case "Steering with a queued message":
      return gt("Steering with a queued message");
    case "Failed to steer with a queued message":
      return gt("Failed to steer with a queued message");
    case "Declined to steer with a queued message":
      return gt("Declined to steer with a queued message");
    case "Stopped steering with a queued message":
      return gt("Stopped steering with a queued message");
    case "Steer with a queued message":
      return gt("Steer with a queued message");
    case "Listed pending questions":
      return gt("Listed pending questions");
    case "Listing pending questions":
      return gt("Listing pending questions");
    case "Failed to list pending questions":
      return gt("Failed to list pending questions");
    case "Declined to list pending questions":
      return gt("Declined to list pending questions");
    case "Stopped listing pending questions":
      return gt("Stopped listing pending questions");
    case "List pending questions":
      return gt("List pending questions");
    case "Read pending questions":
      return gt("Read pending questions");
    case "Reading pending questions":
      return gt("Reading pending questions");
    case "Failed to read pending questions":
      return gt("Failed to read pending questions");
    case "Declined to read pending questions":
      return gt("Declined to read pending questions");
    case "Stopped reading pending questions":
      return gt("Stopped reading pending questions");
    case "Answered pending questions":
      return gt("Answered pending questions");
    case "Answering pending questions":
      return gt("Answering pending questions");
    case "Failed to answer pending questions":
      return gt("Failed to answer pending questions");
    case "Declined to answer pending questions":
      return gt("Declined to answer pending questions");
    case "Stopped answering pending questions":
      return gt("Stopped answering pending questions");
    case "Answer pending questions":
      return gt("Answer pending questions");
    case "Read thread configuration":
      return gt("Read thread configuration");
    case "Reading thread configuration":
      return gt("Reading thread configuration");
    case "Failed to read thread configuration":
      return gt("Failed to read thread configuration");
    case "Declined to read thread configuration":
      return gt("Declined to read thread configuration");
    case "Stopped reading thread configuration":
      return gt("Stopped reading thread configuration");
    case "Used thread model settings":
      return gt("Used thread model settings");
    case "Using thread model settings":
      return gt("Using thread model settings");
    case "Failed to use thread model settings":
      return gt("Failed to use thread model settings");
    case "Declined to use thread model settings":
      return gt("Declined to use thread model settings");
    case "Stopped using thread model settings":
      return gt("Stopped using thread model settings");
    case "Use thread model settings":
      return gt("Use thread model settings");
    case "Used thread transfers":
      return gt("Used thread transfers");
    case "Using thread transfers":
      return gt("Using thread transfers");
    case "Failed to use thread transfers":
      return gt("Failed to use thread transfers");
    case "Declined to use thread transfers":
      return gt("Declined to use thread transfers");
    case "Stopped using thread transfers":
      return gt("Stopped using thread transfers");
    case "Use thread transfers":
      return gt("Use thread transfers");
    case "Requested a fork of this thread":
      return gt("Requested a fork of this thread");
    case "Forking this thread":
      return gt("Forking this thread");
    case "Failed to fork this thread":
      return gt("Failed to fork this thread");
    case "Declined to fork this thread":
      return gt("Declined to fork this thread");
    case "Stopped forking this thread":
      return gt("Stopped forking this thread");
    case "Fork this thread":
      return gt("Fork this thread");
    case "Requested a merge of thread context":
      return gt("Requested a merge of thread context");
    case "Merging thread context":
      return gt("Merging thread context");
    case "Failed to merge thread context":
      return gt("Failed to merge thread context");
    case "Declined to merge thread context":
      return gt("Declined to merge thread context");
    case "Stopped merging thread context":
      return gt("Stopped merging thread context");
    case "Merge thread context":
      return gt("Merge thread context");
    case "Searched thread content":
      return gt("Searched thread content");
    case "Searching thread content":
      return gt("Searching thread content");
    case "Failed to search thread content":
      return gt("Failed to search thread content");
    case "Declined to search thread content":
      return gt("Declined to search thread content");
    case "Stopped searching thread content":
      return gt("Stopped searching thread content");
    case "Search thread content":
      return gt("Search thread content");
    case "Read thread transfers":
      return gt("Read thread transfers");
    case "Reading thread transfers":
      return gt("Reading thread transfers");
    case "Failed to read thread transfers":
      return gt("Failed to read thread transfers");
    case "Declined to read thread transfers":
      return gt("Declined to read thread transfers");
    case "Stopped reading thread transfers":
      return gt("Stopped reading thread transfers");
    case "Organized a thread":
      return gt("Organized a thread");
    case "Organizing a thread":
      return gt("Organizing a thread");
    case "Failed to organize a thread":
      return gt("Failed to organize a thread");
    case "Declined to organize a thread":
      return gt("Declined to organize a thread");
    case "Stopped organizing a thread":
      return gt("Stopped organizing a thread");
    case "Organize a thread":
      return gt("Organize a thread");
    case "Updated T3 thread metadata":
      return gt("Updated T3 thread metadata");
    case "Updating T3 thread metadata":
      return gt("Updating T3 thread metadata");
    case "Failed to update T3 thread metadata":
      return gt("Failed to update T3 thread metadata");
    case "Declined to update T3 thread metadata":
      return gt("Declined to update T3 thread metadata");
    case "Stopped updating T3 thread metadata":
      return gt("Stopped updating T3 thread metadata");
    case "Update T3 thread metadata":
      return gt("Update T3 thread metadata");
    case "Listed workspace branches":
      return gt("Listed workspace branches");
    case "Listing workspace branches":
      return gt("Listing workspace branches");
    case "Failed to list workspace branches":
      return gt("Failed to list workspace branches");
    case "Declined to list workspace branches":
      return gt("Declined to list workspace branches");
    case "Stopped listing workspace branches":
      return gt("Stopped listing workspace branches");
    case "List workspace branches":
      return gt("List workspace branches");
    case "Listed preview tabs":
      return gt("Listed preview tabs");
    case "Listing preview tabs":
      return gt("Listing preview tabs");
    case "Failed to list preview tabs":
      return gt("Failed to list preview tabs");
    case "Declined to list preview tabs":
      return gt("Declined to list preview tabs");
    case "Stopped listing preview tabs":
      return gt("Stopped listing preview tabs");
    case "List preview tabs":
      return gt("List preview tabs");
    case "Closed a preview tab":
      return gt("Closed a preview tab");
    case "Closing a preview tab":
      return gt("Closing a preview tab");
    case "Failed to close a preview tab":
      return gt("Failed to close a preview tab");
    case "Declined to close a preview tab":
      return gt("Declined to close a preview tab");
    case "Stopped closing a preview tab":
      return gt("Stopped closing a preview tab");
    case "Close a preview tab":
      return gt("Close a preview tab");
    case "Read environment preferences":
      return gt("Read environment preferences");
    case "Reading environment preferences":
      return gt("Reading environment preferences");
    case "Failed to read environment preferences":
      return gt("Failed to read environment preferences");
    case "Declined to read environment preferences":
      return gt("Declined to read environment preferences");
    case "Stopped reading environment preferences":
      return gt("Stopped reading environment preferences");
    case "Listed linked environments":
      return gt("Listed linked environments");
    case "Listing linked environments":
      return gt("Listing linked environments");
    case "Failed to list linked environments":
      return gt("Failed to list linked environments");
    case "Declined to list linked environments":
      return gt("Declined to list linked environments");
    case "Stopped listing linked environments":
      return gt("Stopped listing linked environments");
    case "List linked environments":
      return gt("List linked environments");
    case "Asked to link an environment":
      return gt("Asked to link an environment");
    case "Asking to link an environment":
      return gt("Asking to link an environment");
    case "Failed to ask to link an environment":
      return gt("Failed to ask to link an environment");
    case "Declined to ask to link an environment":
      return gt("Declined to ask to link an environment");
    case "Stopped asking to link an environment":
      return gt("Stopped asking to link an environment");
    case "Ask to link an environment":
      return gt("Ask to link an environment");
    case "Forgot a linked environment":
      return gt("Forgot a linked environment");
    case "Forgetting a linked environment":
      return gt("Forgetting a linked environment");
    case "Failed to forget a linked environment":
      return gt("Failed to forget a linked environment");
    case "Declined to forget a linked environment":
      return gt("Declined to forget a linked environment");
    case "Stopped forgetting a linked environment":
      return gt("Stopped forgetting a linked environment");
    case "Forget a linked environment":
      return gt("Forget a linked environment");
    case "Updated environment preferences":
      return gt("Updated environment preferences");
    case "Updating environment preferences":
      return gt("Updating environment preferences");
    case "Failed to update environment preferences":
      return gt("Failed to update environment preferences");
    case "Declined to update environment preferences":
      return gt("Declined to update environment preferences");
    case "Stopped updating environment preferences":
      return gt("Stopped updating environment preferences");
    case "Update environment preferences":
      return gt("Update environment preferences");
    case "Read themes":
      return gt("Read themes");
    case "Reading themes":
      return gt("Reading themes");
    case "Failed to read themes":
      return gt("Failed to read themes");
    case "Declined to read themes":
      return gt("Declined to read themes");
    case "Stopped reading themes":
      return gt("Stopped reading themes");
    case "Set the theme":
      return gt("Set the theme");
    case "Setting the theme":
      return gt("Setting the theme");
    case "Failed to set the theme":
      return gt("Failed to set the theme");
    case "Declined to set the theme":
      return gt("Declined to set the theme");
    case "Stopped setting the theme":
      return gt("Stopped setting the theme");
    case "Launched a project thread":
      return gt("Launched a project thread");
    case "Launching a project thread":
      return gt("Launching a project thread");
    case "Failed to launch a project thread":
      return gt("Failed to launch a project thread");
    case "Declined to launch a project thread":
      return gt("Declined to launch a project thread");
    case "Stopped launching a project thread":
      return gt("Stopped launching a project thread");
    case "Launch a project thread":
      return gt("Launch a project thread");
    case "Listed projects":
      return gt("Listed projects");
    case "Listing projects":
      return gt("Listing projects");
    case "Failed to list projects":
      return gt("Failed to list projects");
    case "Declined to list projects":
      return gt("Declined to list projects");
    case "Stopped listing projects":
      return gt("Stopped listing projects");
    case "List projects":
      return gt("List projects");
    case "Read a project":
      return gt("Read a project");
    case "Reading a project":
      return gt("Reading a project");
    case "Failed to read a project":
      return gt("Failed to read a project");
    case "Declined to read a project":
      return gt("Declined to read a project");
    case "Stopped reading a project":
      return gt("Stopped reading a project");
    case "Registered a project":
      return gt("Registered a project");
    case "Registering a project":
      return gt("Registering a project");
    case "Failed to register a project":
      return gt("Failed to register a project");
    case "Declined to register a project":
      return gt("Declined to register a project");
    case "Stopped registering a project":
      return gt("Stopped registering a project");
    case "Register a project":
      return gt("Register a project");
    case "Updated a project":
      return gt("Updated a project");
    case "Updating a project":
      return gt("Updating a project");
    case "Failed to update a project":
      return gt("Failed to update a project");
    case "Declined to update a project":
      return gt("Declined to update a project");
    case "Stopped updating a project":
      return gt("Stopped updating a project");
    case "Update a project":
      return gt("Update a project");
    case "Deleted a project":
      return gt("Deleted a project");
    case "Deleting a project":
      return gt("Deleting a project");
    case "Failed to delete a project":
      return gt("Failed to delete a project");
    case "Declined to delete a project":
      return gt("Declined to delete a project");
    case "Stopped deleting a project":
      return gt("Stopped deleting a project");
    case "Delete a project":
      return gt("Delete a project");
    case "Cloned a repository":
      return gt("Cloned a repository");
    case "Cloning a repository":
      return gt("Cloning a repository");
    case "Failed to clone a repository":
      return gt("Failed to clone a repository");
    case "Declined to clone a repository":
      return gt("Declined to clone a repository");
    case "Stopped cloning a repository":
      return gt("Stopped cloning a repository");
    case "Clone a repository":
      return gt("Clone a repository");
    case "Prepared an attachment upload":
      return gt("Prepared an attachment upload");
    case "Preparing an attachment upload":
      return gt("Preparing an attachment upload");
    case "Failed to prepare an attachment upload":
      return gt("Failed to prepare an attachment upload");
    case "Declined to prepare an attachment upload":
      return gt("Declined to prepare an attachment upload");
    case "Stopped preparing an attachment upload":
      return gt("Stopped preparing an attachment upload");
    case "Prepare an attachment upload":
      return gt("Prepare an attachment upload");
    case "Discarded a pending attachment":
      return gt("Discarded a pending attachment");
    case "Discarding a pending attachment":
      return gt("Discarding a pending attachment");
    case "Failed to discard a pending attachment":
      return gt("Failed to discard a pending attachment");
    case "Declined to discard a pending attachment":
      return gt("Declined to discard a pending attachment");
    case "Stopped discarding a pending attachment":
      return gt("Stopped discarding a pending attachment");
    case "Discard a pending attachment":
      return gt("Discard a pending attachment");
    case "Sent attachments":
      return gt("Sent attachments");
    case "Sending attachments":
      return gt("Sending attachments");
    case "Failed to send attachments":
      return gt("Failed to send attachments");
    case "Declined to send attachments":
      return gt("Declined to send attachments");
    case "Stopped sending attachments":
      return gt("Stopped sending attachments");
    case "Send attachments":
      return gt("Send attachments");
    case "Previewed an HTML page":
      return gt("Previewed an HTML page");
    case "Previewing an HTML page":
      return gt("Previewing an HTML page");
    case "Failed to preview an HTML page":
      return gt("Failed to preview an HTML page");
    case "Declined to preview an HTML page":
      return gt("Declined to preview an HTML page");
    case "Stopped previewing an HTML page":
      return gt("Stopped previewing an HTML page");
    case "Preview an HTML page":
      return gt("Preview an HTML page");
    case "Rendered an HTML page":
      return gt("Rendered an HTML page");
    case "Rendering an HTML page":
      return gt("Rendering an HTML page");
    case "Failed to render an HTML page":
      return gt("Failed to render an HTML page");
    case "Declined to render an HTML page":
      return gt("Declined to render an HTML page");
    case "Stopped rendering an HTML page":
      return gt("Stopped rendering an HTML page");
    case "Render an HTML page":
      return gt("Render an HTML page");
    case "Sent a message":
      return gt("Sent a message");
    case "Sending a message":
      return gt("Sending a message");
    case "Failed to send a message":
      return gt("Failed to send a message");
    case "Declined to send a message":
      return gt("Declined to send a message");
    case "Stopped sending a message":
      return gt("Stopped sending a message");
    case "Send a message":
      return gt("Send a message");
    case "Sent messages to {n} threads":
      return gt("Sent messages to {count} threads", { count: n[0]! });
    case "Tried to send messages to {n} threads":
      return gt("Tried to send messages to {count} threads", { count: n[0]! });
    case "Sent 1 message to 1 thread":
      return gt("Sent 1 message to 1 thread");
    case "Tried to send 1 message to 1 thread":
      return gt("Tried to send 1 message to 1 thread");
    case "Sent {n} messages to 1 thread":
      return gt("Sent {messages} messages to 1 thread", { messages: n[0]! });
    case "Tried to send {n} messages to 1 thread":
      return gt("Tried to send {messages} messages to 1 thread", { messages: n[0]! });
    case "Sent 1 message to {n} threads":
      return gt("Sent 1 message to {threads} threads", { threads: n[0]! });
    case "Tried to send 1 message to {n} threads":
      return gt("Tried to send 1 message to {threads} threads", { threads: n[0]! });
    case "Sent {n} messages to {n} threads":
      return gt("Sent {messages} messages to {threads} threads", {
        messages: n[0]!,
        threads: n[1]!,
      });
    case "Tried to send {n} messages to {n} threads":
      return gt("Tried to send {messages} messages to {threads} threads", {
        messages: n[0]!,
        threads: n[1]!,
      });
    case "Sent 1 message":
      return gt("Sent 1 message");
    case "Tried to send 1 message":
      return gt("Tried to send 1 message");
    case "Sent {n} messages":
      return gt("Sent {count} messages", { count: n[0]! });
    case "Tried to send {n} messages":
      return gt("Tried to send {count} messages", { count: n[0]! });
    case "Requested thread creation 1 time":
      return gt("Requested thread creation 1 time");
    case "Requested thread creation {n} times":
      return gt("Requested thread creation {count} times", { count: n[0]! });
    case "Delegated 1 task":
      return gt("Delegated 1 task");
    case "Tried to delegate 1 task":
      return gt("Tried to delegate 1 task");
    case "Delegated {n} tasks":
      return gt("Delegated {count} tasks", { count: n[0]! });
    case "Tried to delegate {n} tasks":
      return gt("Tried to delegate {count} tasks", { count: n[0]! });
    case "Read 1 thread":
      return gt("Read 1 thread");
    case "Tried to read 1 thread":
      return gt("Tried to read 1 thread");
    case "Read {n} threads":
      return gt("Read {count} threads", { count: n[0]! });
    case "Tried to read {n} threads":
      return gt("Tried to read {count} threads", { count: n[0]! });
    case "Read threads 1 time":
      return gt("Read threads 1 time");
    case "Tried to read threads 1 time":
      return gt("Tried to read threads 1 time");
    case "Read threads {n} times":
      return gt("Read threads {count} times", { count: n[0]! });
    case "Tried to read threads {n} times":
      return gt("Tried to read threads {count} times", { count: n[0]! });
    case "Waited on 1 thread":
      return gt("Waited on 1 thread");
    case "Tried to wait on 1 thread":
      return gt("Tried to wait on 1 thread");
    case "Waited on {n} threads":
      return gt("Waited on {count} threads", { count: n[0]! });
    case "Tried to wait on {n} threads":
      return gt("Tried to wait on {count} threads", { count: n[0]! });
    case "Waited on threads 1 time":
      return gt("Waited on threads 1 time");
    case "Tried to wait on threads 1 time":
      return gt("Tried to wait on threads 1 time");
    case "Waited on threads {n} times":
      return gt("Waited on threads {count} times", { count: n[0]! });
    case "Tried to wait on threads {n} times":
      return gt("Tried to wait on threads {count} times", { count: n[0]! });
    case "Listed threads 1 time":
      return gt("Listed threads 1 time");
    case "Tried to list threads 1 time":
      return gt("Tried to list threads 1 time");
    case "Listed threads {n} times":
      return gt("Listed threads {count} times", { count: n[0]! });
    case "Tried to list threads {n} times":
      return gt("Tried to list threads {count} times", { count: n[0]! });
    case "Requested interrupts for 1 thread":
      return gt("Requested interrupts for 1 thread");
    case "Tried to interrupt 1 thread":
      return gt("Tried to interrupt 1 thread");
    case "Requested interrupts for {n} threads":
      return gt("Requested interrupts for {count} threads", { count: n[0]! });
    case "Tried to interrupt {n} threads":
      return gt("Tried to interrupt {count} threads", { count: n[0]! });
    case "Requested stops for 1 workflow":
      return gt("Requested stops for 1 workflow");
    case "Tried to stop 1 workflow":
      return gt("Tried to stop 1 workflow");
    case "Requested stops for {n} workflows":
      return gt("Requested stops for {count} workflows", { count: n[0]! });
    case "Tried to stop {n} workflows":
      return gt("Tried to stop {count} workflows", { count: n[0]! });
    case "Checked task status 1 time":
      return gt("Checked task status 1 time");
    case "Tried to check task status 1 time":
      return gt("Tried to check task status 1 time");
    case "Checked task status {n} times":
      return gt("Checked task status {count} times", { count: n[0]! });
    case "Tried to check task status {n} times":
      return gt("Tried to check task status {count} times", { count: n[0]! });
    case "Updated background waits 1 time":
      return gt("Updated background waits 1 time");
    case "Tried to update background waits 1 time":
      return gt("Tried to update background waits 1 time");
    case "Updated background waits {n} times":
      return gt("Updated background waits {count} times", { count: n[0]! });
    case "Tried to update background waits {n} times":
      return gt("Tried to update background waits {count} times", { count: n[0]! });
    case "Requested cancellation of 1 task":
      return gt("Requested cancellation of 1 task");
    case "Tried to cancel 1 task":
      return gt("Tried to cancel 1 task");
    case "Requested cancellation of {n} tasks":
      return gt("Requested cancellation of {count} tasks", { count: n[0]! });
    case "Tried to cancel {n} tasks":
      return gt("Tried to cancel {count} tasks", { count: n[0]! });
    case "Scheduled 1 task":
      return gt("Scheduled 1 task");
    case "Tried to schedule 1 task":
      return gt("Tried to schedule 1 task");
    case "Scheduled {n} tasks":
      return gt("Scheduled {count} tasks", { count: n[0]! });
    case "Tried to schedule {n} tasks":
      return gt("Tried to schedule {count} tasks", { count: n[0]! });
    case "Listed scheduled tasks 1 time":
      return gt("Listed scheduled tasks 1 time");
    case "Tried to list scheduled tasks 1 time":
      return gt("Tried to list scheduled tasks 1 time");
    case "Listed scheduled tasks {n} times":
      return gt("Listed scheduled tasks {count} times", { count: n[0]! });
    case "Tried to list scheduled tasks {n} times":
      return gt("Tried to list scheduled tasks {count} times", { count: n[0]! });
    case "Updated 1 scheduled task":
      return gt("Updated 1 scheduled task");
    case "Tried to update 1 scheduled task":
      return gt("Tried to update 1 scheduled task");
    case "Updated {n} scheduled tasks":
      return gt("Updated {count} scheduled tasks", { count: n[0]! });
    case "Tried to update {n} scheduled tasks":
      return gt("Tried to update {count} scheduled tasks", { count: n[0]! });
    case "Requested deletion of 1 scheduled task":
      return gt("Requested deletion of 1 scheduled task");
    case "Tried to delete 1 scheduled task":
      return gt("Tried to delete 1 scheduled task");
    case "Requested deletion of {n} scheduled tasks":
      return gt("Requested deletion of {count} scheduled tasks", { count: n[0]! });
    case "Tried to delete {n} scheduled tasks":
      return gt("Tried to delete {count} scheduled tasks", { count: n[0]! });
    case "Requested 1 scheduled task run":
      return gt("Requested 1 scheduled task run");
    case "Tried to request 1 scheduled task run":
      return gt("Tried to request 1 scheduled task run");
    case "Requested {n} scheduled task runs":
      return gt("Requested {count} scheduled task runs", { count: n[0]! });
    case "Tried to request {n} scheduled task runs":
      return gt("Tried to request {count} scheduled task runs", { count: n[0]! });
    case "Checked thread configuration 1 time":
      return gt("Checked thread configuration 1 time");
    case "Tried to check thread configuration 1 time":
      return gt("Tried to check thread configuration 1 time");
    case "Checked thread configuration {n} times":
      return gt("Checked thread configuration {count} times", { count: n[0]! });
    case "Tried to check thread configuration {n} times":
      return gt("Tried to check thread configuration {count} times", { count: n[0]! });
    case "Set thread model 1 time":
      return gt("Set thread model 1 time");
    case "Tried to set thread model 1 time":
      return gt("Tried to set thread model 1 time");
    case "Set thread model {n} times":
      return gt("Set thread model {count} times", { count: n[0]! });
    case "Tried to set thread model {n} times":
      return gt("Tried to set thread model {count} times", { count: n[0]! });
    case "Requested 1 thread fork":
      return gt("Requested 1 thread fork");
    case "Tried to request 1 thread fork":
      return gt("Tried to request 1 thread fork");
    case "Requested {n} thread forks":
      return gt("Requested {count} thread forks", { count: n[0]! });
    case "Tried to request {n} thread forks":
      return gt("Tried to request {count} thread forks", { count: n[0]! });
    case "Requested 1 context merge":
      return gt("Requested 1 context merge");
    case "Tried to request 1 context merge":
      return gt("Tried to request 1 context merge");
    case "Requested {n} context merges":
      return gt("Requested {count} context merges", { count: n[0]! });
    case "Tried to request {n} context merges":
      return gt("Tried to request {count} context merges", { count: n[0]! });
    case "Searched threads 1 time":
      return gt("Searched threads 1 time");
    case "Tried to search threads 1 time":
      return gt("Tried to search threads 1 time");
    case "Searched threads {n} times":
      return gt("Searched threads {count} times", { count: n[0]! });
    case "Tried to search threads {n} times":
      return gt("Tried to search threads {count} times", { count: n[0]! });
    case "Checked thread transfers 1 time":
      return gt("Checked thread transfers 1 time");
    case "Tried to check thread transfers 1 time":
      return gt("Tried to check thread transfers 1 time");
    case "Checked thread transfers {n} times":
      return gt("Checked thread transfers {count} times", { count: n[0]! });
    case "Tried to check thread transfers {n} times":
      return gt("Tried to check thread transfers {count} times", { count: n[0]! });
    case "Organized threads 1 time":
      return gt("Organized threads 1 time");
    case "Tried to organize threads 1 time":
      return gt("Tried to organize threads 1 time");
    case "Organized threads {n} times":
      return gt("Organized threads {count} times", { count: n[0]! });
    case "Tried to organize threads {n} times":
      return gt("Tried to organize threads {count} times", { count: n[0]! });
    case "Updated 1 thread":
      return gt("Updated 1 thread");
    case "Tried to update 1 thread":
      return gt("Tried to update 1 thread");
    case "Updated {n} threads":
      return gt("Updated {count} threads", { count: n[0]! });
    case "Tried to update {n} threads":
      return gt("Tried to update {count} threads", { count: n[0]! });
    case "Listed queued messages 1 time":
      return gt("Listed queued messages 1 time");
    case "Tried to list queued messages 1 time":
      return gt("Tried to list queued messages 1 time");
    case "Listed queued messages {n} times":
      return gt("Listed queued messages {count} times", { count: n[0]! });
    case "Tried to list queued messages {n} times":
      return gt("Tried to list queued messages {count} times", { count: n[0]! });
    case "Read 1 queued message":
      return gt("Read 1 queued message");
    case "Tried to read 1 queued message":
      return gt("Tried to read 1 queued message");
    case "Read {n} queued messages":
      return gt("Read {count} queued messages", { count: n[0]! });
    case "Tried to read {n} queued messages":
      return gt("Tried to read {count} queued messages", { count: n[0]! });
    case "Edited 1 queued message":
      return gt("Edited 1 queued message");
    case "Tried to edit 1 queued message":
      return gt("Tried to edit 1 queued message");
    case "Edited {n} queued messages":
      return gt("Edited {count} queued messages", { count: n[0]! });
    case "Tried to edit {n} queued messages":
      return gt("Tried to edit {count} queued messages", { count: n[0]! });
    case "Requested cancellation of 1 queued run":
      return gt("Requested cancellation of 1 queued run");
    case "Tried to cancel 1 queued run":
      return gt("Tried to cancel 1 queued run");
    case "Requested cancellation of {n} queued runs":
      return gt("Requested cancellation of {count} queued runs", { count: n[0]! });
    case "Tried to cancel {n} queued runs":
      return gt("Tried to cancel {count} queued runs", { count: n[0]! });
    case "Reordered 1 queued run":
      return gt("Reordered 1 queued run");
    case "Tried to reorder 1 queued run":
      return gt("Tried to reorder 1 queued run");
    case "Reordered {n} queued runs":
      return gt("Reordered {count} queued runs", { count: n[0]! });
    case "Tried to reorder {n} queued runs":
      return gt("Tried to reorder {count} queued runs", { count: n[0]! });
    case "Requested steering with 1 queued message":
      return gt("Requested steering with 1 queued message");
    case "Tried to steer with 1 queued message":
      return gt("Tried to steer with 1 queued message");
    case "Requested steering with {n} queued messages":
      return gt("Requested steering with {count} queued messages", { count: n[0]! });
    case "Tried to steer with {n} queued messages":
      return gt("Tried to steer with {count} queued messages", { count: n[0]! });
    case "Listed pending questions 1 time":
      return gt("Listed pending questions 1 time");
    case "Tried to list pending questions 1 time":
      return gt("Tried to list pending questions 1 time");
    case "Listed pending questions {n} times":
      return gt("Listed pending questions {count} times", { count: n[0]! });
    case "Tried to list pending questions {n} times":
      return gt("Tried to list pending questions {count} times", { count: n[0]! });
    case "Read 1 pending question request":
      return gt("Read 1 pending question request");
    case "Tried to read 1 pending question request":
      return gt("Tried to read 1 pending question request");
    case "Read {n} pending question requests":
      return gt("Read {count} pending question requests", { count: n[0]! });
    case "Tried to read {n} pending question requests":
      return gt("Tried to read {count} pending question requests", { count: n[0]! });
    case "Answered 1 pending question request":
      return gt("Answered 1 pending question request");
    case "Tried to answer 1 pending question request":
      return gt("Tried to answer 1 pending question request");
    case "Answered {n} pending question requests":
      return gt("Answered {count} pending question requests", { count: n[0]! });
    case "Tried to answer {n} pending question requests":
      return gt("Tried to answer {count} pending question requests", { count: n[0]! });
    case "Asked for 1 secret":
      return gt("Asked for 1 secret");
    case "Tried to ask for 1 secret":
      return gt("Tried to ask for 1 secret");
    case "Asked for {n} secrets":
      return gt("Asked for {count} secrets", { count: n[0]! });
    case "Tried to ask for {n} secrets":
      return gt("Tried to ask for {count} secrets", { count: n[0]! });
    case "Handed off to 1 worktree":
      return gt("Handed off to 1 worktree");
    case "Tried to hand off to 1 worktree":
      return gt("Tried to hand off to 1 worktree");
    case "Handed off to {n} worktrees":
      return gt("Handed off to {count} worktrees", { count: n[0]! });
    case "Tried to hand off to {n} worktrees":
      return gt("Tried to hand off to {count} worktrees", { count: n[0]! });
    case "Listed workspace branches 1 time":
      return gt("Listed workspace branches 1 time");
    case "Tried to list workspace branches 1 time":
      return gt("Tried to list workspace branches 1 time");
    case "Listed workspace branches {n} times":
      return gt("Listed workspace branches {count} times", { count: n[0]! });
    case "Tried to list workspace branches {n} times":
      return gt("Tried to list workspace branches {count} times", { count: n[0]! });
    case "Checked worktree status 1 time":
      return gt("Checked worktree status 1 time");
    case "Tried to check worktree status 1 time":
      return gt("Tried to check worktree status 1 time");
    case "Checked worktree status {n} times":
      return gt("Checked worktree status {count} times", { count: n[0]! });
    case "Tried to check worktree status {n} times":
      return gt("Tried to check worktree status {count} times", { count: n[0]! });
    case "Listed projects 1 time":
      return gt("Listed projects 1 time");
    case "Tried to list projects 1 time":
      return gt("Tried to list projects 1 time");
    case "Listed projects {n} times":
      return gt("Listed projects {count} times", { count: n[0]! });
    case "Tried to list projects {n} times":
      return gt("Tried to list projects {count} times", { count: n[0]! });
    case "Read 1 project":
      return gt("Read 1 project");
    case "Tried to read 1 project":
      return gt("Tried to read 1 project");
    case "Read {n} projects":
      return gt("Read {count} projects", { count: n[0]! });
    case "Tried to read {n} projects":
      return gt("Tried to read {count} projects", { count: n[0]! });
    case "Registered 1 project":
      return gt("Registered 1 project");
    case "Tried to register 1 project":
      return gt("Tried to register 1 project");
    case "Registered {n} projects":
      return gt("Registered {count} projects", { count: n[0]! });
    case "Tried to register {n} projects":
      return gt("Tried to register {count} projects", { count: n[0]! });
    case "Updated 1 project":
      return gt("Updated 1 project");
    case "Tried to update 1 project":
      return gt("Tried to update 1 project");
    case "Updated {n} projects":
      return gt("Updated {count} projects", { count: n[0]! });
    case "Tried to update {n} projects":
      return gt("Tried to update {count} projects", { count: n[0]! });
    case "Deleted 1 project":
      return gt("Deleted 1 project");
    case "Tried to delete 1 project":
      return gt("Tried to delete 1 project");
    case "Deleted {n} projects":
      return gt("Deleted {count} projects", { count: n[0]! });
    case "Tried to delete {n} projects":
      return gt("Tried to delete {count} projects", { count: n[0]! });
    case "Cloned 1 repository":
      return gt("Cloned 1 repository");
    case "Tried to clone 1 repository":
      return gt("Tried to clone 1 repository");
    case "Cloned {n} repositories":
      return gt("Cloned {count} repositories", { count: n[0]! });
    case "Tried to clone {n} repositories":
      return gt("Tried to clone {count} repositories", { count: n[0]! });
    case "Checked environment preferences 1 time":
      return gt("Checked environment preferences 1 time");
    case "Tried to check environment preferences 1 time":
      return gt("Tried to check environment preferences 1 time");
    case "Checked environment preferences {n} times":
      return gt("Checked environment preferences {count} times", { count: n[0]! });
    case "Tried to check environment preferences {n} times":
      return gt("Tried to check environment preferences {count} times", { count: n[0]! });
    case "Updated environment preferences 1 time":
      return gt("Updated environment preferences 1 time");
    case "Tried to update environment preferences 1 time":
      return gt("Tried to update environment preferences 1 time");
    case "Updated environment preferences {n} times":
      return gt("Updated environment preferences {count} times", { count: n[0]! });
    case "Tried to update environment preferences {n} times":
      return gt("Tried to update environment preferences {count} times", { count: n[0]! });
    case "Checked themes 1 time":
      return gt("Checked themes 1 time");
    case "Tried to check themes 1 time":
      return gt("Tried to check themes 1 time");
    case "Checked themes {n} times":
      return gt("Checked themes {count} times", { count: n[0]! });
    case "Tried to check themes {n} times":
      return gt("Tried to check themes {count} times", { count: n[0]! });
    case "Set the theme 1 time":
      return gt("Set the theme 1 time");
    case "Tried to set the theme 1 time":
      return gt("Tried to set the theme 1 time");
    case "Set the theme {n} times":
      return gt("Set the theme {count} times", { count: n[0]! });
    case "Tried to set the theme {n} times":
      return gt("Tried to set the theme {count} times", { count: n[0]! });
    case "Listed linked environments 1 time":
      return gt("Listed linked environments 1 time");
    case "Tried to list linked environments 1 time":
      return gt("Tried to list linked environments 1 time");
    case "Listed linked environments {n} times":
      return gt("Listed linked environments {count} times", { count: n[0]! });
    case "Tried to list linked environments {n} times":
      return gt("Tried to list linked environments {count} times", { count: n[0]! });
    case "Asked to link 1 environment":
      return gt("Asked to link 1 environment");
    case "Tried to ask to link 1 environment":
      return gt("Tried to ask to link 1 environment");
    case "Asked to link {n} environments":
      return gt("Asked to link {count} environments", { count: n[0]! });
    case "Tried to ask to link {n} environments":
      return gt("Tried to ask to link {count} environments", { count: n[0]! });
    case "Forgot 1 linked environment":
      return gt("Forgot 1 linked environment");
    case "Tried to forget 1 linked environment":
      return gt("Tried to forget 1 linked environment");
    case "Forgot {n} linked environments":
      return gt("Forgot {count} linked environments", { count: n[0]! });
    case "Tried to forget {n} linked environments":
      return gt("Tried to forget {count} linked environments", { count: n[0]! });
    case "Prepared 1 attachment upload":
      return gt("Prepared 1 attachment upload");
    case "Tried to prepare 1 attachment upload":
      return gt("Tried to prepare 1 attachment upload");
    case "Prepared {n} attachment uploads":
      return gt("Prepared {count} attachment uploads", { count: n[0]! });
    case "Tried to prepare {n} attachment uploads":
      return gt("Tried to prepare {count} attachment uploads", { count: n[0]! });
    case "Discarded 1 pending attachment":
      return gt("Discarded 1 pending attachment");
    case "Tried to discard 1 pending attachment":
      return gt("Tried to discard 1 pending attachment");
    case "Discarded {n} pending attachments":
      return gt("Discarded {count} pending attachments", { count: n[0]! });
    case "Tried to discard {n} pending attachments":
      return gt("Tried to discard {count} pending attachments", { count: n[0]! });
    case "Sent 1 attachment":
      return gt("Sent 1 attachment");
    case "Tried to send 1 attachment":
      return gt("Tried to send 1 attachment");
    case "Sent {n} attachments":
      return gt("Sent {count} attachments", { count: n[0]! });
    case "Tried to send {n} attachments":
      return gt("Tried to send {count} attachments", { count: n[0]! });
    case "Sent 1 attachment to 1 thread":
      return gt("Sent 1 attachment to 1 thread");
    case "Tried to send 1 attachment to 1 thread":
      return gt("Tried to send 1 attachment to 1 thread");
    case "Sent {n} attachments to 1 thread":
      return gt("Sent {attachments} attachments to 1 thread", { attachments: n[0]! });
    case "Tried to send {n} attachments to 1 thread":
      return gt("Tried to send {attachments} attachments to 1 thread", { attachments: n[0]! });
    case "Sent 1 attachment to {n} threads":
      return gt("Sent 1 attachment to {threads} threads", { threads: n[0]! });
    case "Tried to send 1 attachment to {n} threads":
      return gt("Tried to send 1 attachment to {threads} threads", { threads: n[0]! });
    case "Sent {n} attachments to {n} threads":
      return gt("Sent {attachments} attachments to {threads} threads", {
        attachments: n[0]!,
        threads: n[1]!,
      });
    case "Tried to send {n} attachments to {n} threads":
      return gt("Tried to send {attachments} attachments to {threads} threads", {
        attachments: n[0]!,
        threads: n[1]!,
      });
    case "Sent attachments 1 time":
      return gt("Sent attachments 1 time");
    case "Tried to send attachments 1 time":
      return gt("Tried to send attachments 1 time");
    case "Sent attachments {n} times":
      return gt("Sent attachments {count} times", { count: n[0]! });
    case "Tried to send attachments {n} times":
      return gt("Tried to send attachments {count} times", { count: n[0]! });
    case "Sent attachments to 1 thread 1 time":
      return gt("Sent attachments to 1 thread 1 time");
    case "Tried to send attachments to 1 thread 1 time":
      return gt("Tried to send attachments to 1 thread 1 time");
    case "Sent attachments to 1 thread {n} times":
      return gt("Sent attachments to 1 thread {count} times", { count: n[0]! });
    case "Tried to send attachments to 1 thread {n} times":
      return gt("Tried to send attachments to 1 thread {count} times", { count: n[0]! });
    case "Sent attachments to {n} threads 1 time":
      return gt("Sent attachments to {threads} threads 1 time", { threads: n[0]! });
    case "Tried to send attachments to {n} threads 1 time":
      return gt("Tried to send attachments to {threads} threads 1 time", { threads: n[0]! });
    case "Sent attachments to {n} threads {n} times":
      return gt("Sent attachments to {threads} threads {count} times", {
        threads: n[0]!,
        count: n[1]!,
      });
    case "Tried to send attachments to {n} threads {n} times":
      return gt("Tried to send attachments to {threads} threads {count} times", {
        threads: n[0]!,
        count: n[1]!,
      });
    case "Tried to link pull requests":
      return gt("Tried to link pull requests");
    case "Tried to link 1 pull request":
      return gt("Tried to link 1 pull request");
    case "Tried to link {n} pull requests":
      return gt("Tried to link {count} pull requests", { count: n[0]! });
    case "Unlinked pull requests":
      return gt("Unlinked pull requests");
    case "Tried to unlink pull requests":
      return gt("Tried to unlink pull requests");
    case "Tried to unlink 1 pull request":
      return gt("Tried to unlink 1 pull request");
    case "Tried to unlink {n} pull requests":
      return gt("Tried to unlink {count} pull requests", { count: n[0]! });
    case "Tried to watch 1 pull request":
      return gt("Tried to watch 1 pull request");
    case "Tried to watch {n} pull requests":
      return gt("Tried to watch {count} pull requests", { count: n[0]! });
    case "Tried to stop watching 1 pull request":
      return gt("Tried to stop watching 1 pull request");
    case "Tried to stop watching {n} pull requests":
      return gt("Tried to stop watching {count} pull requests", { count: n[0]! });
    case "Tried to check linked pull requests":
      return gt("Tried to check linked pull requests");
    case "Tried to check linked pull requests {n} times":
      return gt("Tried to check linked pull requests {count} times", { count: n[0]! });
    case "Tried to start writing review guides":
      return gt("Tried to start writing review guides");
    case "Started writing review guides {n} times":
      return gt("Started writing review guides {count} times", { count: n[0]! });
    case "Tried to start writing review guides {n} times":
      return gt("Tried to start writing review guides {count} times", { count: n[0]! });
    case "Could not start 1 review guide":
      return gt("Could not start 1 review guide");
    case "Could not start {n} review guides":
      return gt("Could not start {count} review guides", { count: n[0]! });
    case "Started 1 review guide":
      return gt("Started 1 review guide");
    case "Tried to start 1 review guide":
      return gt("Tried to start 1 review guide");
    case "Started {n} review guides":
      return gt("Started {count} review guides", { count: n[0]! });
    case "Tried to start {n} review guides":
      return gt("Tried to start {count} review guides", { count: n[0]! });
    case "Read 1 review guide":
      return gt("Read 1 review guide");
    case "Tried to read 1 review guide":
      return gt("Tried to read 1 review guide");
    case "Read {n} review guides":
      return gt("Read {count} review guides", { count: n[0]! });
    case "Tried to read {n} review guides":
      return gt("Tried to read {count} review guides", { count: n[0]! });
    case "Tried to use browser 1 time":
      return gt("Tried to use browser 1 time");
    case "Tried to use browser {n} times":
      return gt("Tried to use browser {count} times", { count: n[0]! });
    case "Tried to use device controls 1 time":
      return gt("Tried to use device controls 1 time");
    case "Tried to use device controls {n} times":
      return gt("Tried to use device controls {count} times", { count: n[0]! });
    case "Previewed 1 HTML page":
      return gt("Previewed 1 HTML page");
    case "Tried to preview 1 HTML page":
      return gt("Tried to preview 1 HTML page");
    case "Previewed {n} HTML pages":
      return gt("Previewed {count} HTML pages", { count: n[0]! });
    case "Tried to preview {n} HTML pages":
      return gt("Tried to preview {count} HTML pages", { count: n[0]! });
    case "Rendered 1 HTML page":
      return gt("Rendered 1 HTML page");
    case "Tried to render 1 HTML page":
      return gt("Tried to render 1 HTML page");
    case "Rendered {n} HTML pages":
      return gt("Rendered {count} HTML pages", { count: n[0]! });
    case "Tried to render {n} HTML pages":
      return gt("Tried to render {count} HTML pages", { count: n[0]! });
    case "Checked orchestration capabilities 1 time":
      return gt("Checked orchestration capabilities 1 time");
    case "Tried to check orchestration capabilities 1 time":
      return gt("Tried to check orchestration capabilities 1 time");
    case "Checked orchestration capabilities {n} times":
      return gt("Checked orchestration capabilities {count} times", { count: n[0]! });
    case "Tried to check orchestration capabilities {n} times":
      return gt("Tried to check orchestration capabilities {count} times", { count: n[0]! });
    default:
      return undefined;
  }
}
