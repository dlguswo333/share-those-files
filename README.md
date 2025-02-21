# Share-Those-Files!

<kbd>
    <img alt="logo" src="./static/logo.jpg?raw=true">
</kbd>

For the sake of simplicity, share those files.

Distinguishing features:
- Upload multiple files.
- Get your share link after upload.
- Visit share link to download the files.
- Your file will not be accesible after the specified due date.

## Implementations
### SimpleDB
This is Created out of simplicity, but gets the jobs done.

- Implemented with `sqlite3`.
- Saves uploaded files as-is, on disk.
- Does not allow name collision in the same upload entry.
- Synchronously creates zip file stream upon download requests.
- Removes uploaded files after the due dates.
