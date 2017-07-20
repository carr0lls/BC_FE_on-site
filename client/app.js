import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import axios from 'axios';

      const App = () => {
        return (
          <div id="content">
            <AppLogo />
            <FileManager />
          </div>
        );
      }

      const AppLogo = () => {
        return (
          <div className="header">
            <h1>BuildingConnected: File Manager</h1>
          </div>
        );
      }

      class FileManager extends React.Component {
        constructor(props) {
          super(props);
          this.state = { 
            files: [],
            subfiles: {},
            currentFolderId: '',
            currentDirectory: '/', 
            toggledFolders: {},
            showNewFolderForm: false,
            newFolderName: ''
          };
          this.fetchFiles = this.fetchFiles.bind(this);
          this.updateFiles = this.updateFiles.bind(this);
          this.fetchSubfolderFiles = this.fetchSubfolderFiles.bind(this);
          this.updateSubfolderFiles = this.updateSubfolderFiles.bind(this);
          this.uploadFile = this.uploadFile.bind(this);
          this.createFolder = this.createFolder.bind(this);
          this.createNewFolderForm = this.createNewFolderForm.bind(this);
          this.updateNewFolderName = this.updateNewFolderName.bind(this);
          this.toggleFolder = this.toggleFolder.bind(this);
          this.folderClick = this.folderClick.bind(this);
          this.downloadFile = this.downloadFile.bind(this);
        }

        componentDidMount() {
          this.fetchFiles();
        }

        fetchFiles() {
          const folderId = this.state.currentFolderId;
          if (folderId) {
            axios.get(`http://localhost:8080/api/folders/${folderId}/items`)
            .then(this.updateFiles)
            .catch(function (error) {
              console.log(error);
            });
          }
          else {
            axios.get(`http://localhost:8080/api/files`)
              .then(this.updateFiles)
              .catch(function (error) {
                console.log(error);
              });
          }
        }
        updateFiles({ data }) {
          this.setState({ files: data });
          console.log('state', this.state);
        }
        fetchSubfolderFiles(folderId) {
          axios.get(`http://localhost:8080/api/folders/${folderId}/items`)
          .then((response) => { return {folderId, data: response.data }; })
          .then(this.updateSubfolderFiles)
          .catch(function (error) {
            console.log(error);
          });
        }
        updateSubfolderFiles({ folderId, data }) {
          const subfilesState = this.state.subfiles;
          subfilesState[folderId] = data;
          this.setState({ subfiles: subfilesState });
          console.log('state', this.state);
        }        
        createFolder(e) {
          e.preventDefault();
          const newFolderName = this.state.newFolderName.trim();
          if (newFolderName === '') {
            alert('Folder name cannot be empty!');
            return;
          }

          const folderData = {
            name: newFolderName
          };

          this.setState({ newFolderName: '', showNewFolderForm: false });

          axios.post(`http://localhost:8080/api/folders?parentId=${this.state.currentFolderId}`, folderData)
            .then(this.fetchFiles)
            .catch(function (error) {
              console.log(error);
            });
        }
        uploadFile(e) {
          const fileBlob = new Blob([e.target.files[0]], {type : 'multipart'});
          const fileData = {
            file: e.target.files[0],
            filename: e.target.files[0].name,
            size: e.target.files[0].size
          }
          console.log(fileData);

          axios.post(`http://localhost:8080/api/files?parentId=${this.state.currentFolderId}`, fileData)
            .then(this.fetchFiles)
            .catch(function (error) {
              console.log(error);
            });
        }
        updateNewFolderName(e) {
          this.setState({ [e.target.name]: e.target.value });
        }
        createNewFolderForm(e) {
          this.setState({ showNewFolderForm: true });
        }
        toggleFolder(folderId) {
          const toggledFolderState = this.state.toggledFolders;
          toggledFolderState[folderId] = (!toggledFolderState[folderId]) ? true : false;
          this.setState({ toggledFolders: toggledFolderState });
          console.log('toggledFoldersState', this.state.toggledFolders);
          this.fetchSubfolderFiles(folderId);
        }
        folderClick(fileId, fileName) {
          this.setState({ 
            isLoadingFiles: true, 
            currentFolderId: fileId,
            currentDirectory: `${this.state.currentDirectory}${fileName}/`
          });

          axios.get(`http://localhost:8080/api/folders/${fileId}/items`)
            .then(this.updateFiles)
            .catch((err) => {
              console.log(err);
            });
        }
        downloadFile(fileId, fileType) {
          if (fileType === 'FOLDER')
            return;

          axios.get(`http://localhost:8080/api/files/${fileId}/content`)
            .catch((err) => {
              console.log(err);
            });
        }

        render() {
          return (
            <div className="file-manager">
              <FileManagerHeader currentDirectory={this.state.currentDirectory} onCreateNewFolderForm={this.createNewFolderForm} onUploadFile={this.uploadFile} />
              <FileList files={this.state.files} subfiles={this.state.subfiles} toggledFolders={this.state.toggledFolders} onToggleFolder={this.toggleFolder} onDownloadFile={this.downloadFile} onFolderClick={this.folderClick} onCreateFolder={this.createFolder} onUpdateNewFolderName={this.updateNewFolderName} showNewFolderForm={this.state.showNewFolderForm} />              
            </div>
          );          
        }
      }

      const FileManagerHeader = ({currentDirectory, onCreateNewFolderForm, onUploadFile}) => {
        return (
          <div className="file-header">
            <DirectoryMenu directory={currentDirectory} />
            <FileManagerActions onCreateNewFolderForm={onCreateNewFolderForm} onUploadFile={onUploadFile}/>
          </div>
        );
      }

      const DirectoryMenu = ({directory}) => {
        return (
          <div className="directory-menu">
            <label>Directory:</label>
            <div>{directory}</div>
          </div>
        );
      }

      const FileManagerActions = ({onCreateNewFolderForm, onUploadFile}) => {
        return (
          <div className="actions">
            <Button onClick={onCreateNewFolderForm} classNames={'btn'} >New Folder</Button>
            <input type="file" onChange={onUploadFile} className="btn" />
          </div>
        );
      }

      const Button = ({onClick, classNames, children}) => {
        return (
          <button className={classNames} onClick={onClick}>{children}</button>
        );
      }

      const FileList = ({files, subfiles, toggledFolders, onToggleFolder, onFolderClick, onDownloadFile, showNewFolderForm, onCreateFolder, onUpdateNewFolderName}) => {
        let fileList = files.map((file, index) => {
          return <File key={index} index={index} classNames={'file'} file={file} subfiles={subfiles} toggledFolders={toggledFolders} onFolderClick={onFolderClick} onToggleFolder={onToggleFolder} onDownloadFile={onDownloadFile} />;
        });

        const createFolderFormClasses = classnames('file', {'hidden': !showNewFolderForm})

        return (
          <ul className="file-list">
            <div className="file">
              <li className="heading">
                <div className="name">Name</div>
                <div className="type">Type</div>
                <div className="size">Size</div>
              </li>
            </div>
            <CreateFolderForm classNames={createFolderFormClasses} onCreateFolder={onCreateFolder} onUpdateNewFolderName={onUpdateNewFolderName} />
            { fileList }
          </ul>
        );
      }

      const CreateFolderForm = ({classNames, onCreateFolder, onUpdateNewFolderName}) => {
        let textInput = null;

        function handleCreateClick() {
          textInput.value = '';
        }

        return (
          <div className={classNames}>
            <li>
              <div className="create-new-folder">
                <form onSubmit={onCreateFolder} onChange={onUpdateNewFolderName}>
                  <input id="new-folder-input" type="text" name="newFolderName" placeholder="New folder name" ref={(input) => { textInput = input; }} />
                  <button type="submit" className="btn" onClick={handleCreateClick}>Create</button>
                </form>
              </div>
            </li>
          </div>
        );
      }

      const File = ({index, classNames, file, subfiles, toggledFolders, onFolderClick, onToggleFolder, onDownloadFile}) => {
        let handleOnFolderClick, toggleButton, downloadButton, toggleText, subfilesList;

        toggleText = (toggledFolders[file._id]) ? '-' : '+';

        if (toggledFolders[file._id] && subfiles[file._id]) {
          subfilesList = subfiles[file._id].map((subfile, index) => {
            return <File key={index} index={index} classNames={'file subfile'} file={subfile} subfiles={subfiles} toggledFolders={toggledFolders} onFolderClick={onFolderClick} onToggleFolder={onToggleFolder} onDownloadFile={onDownloadFile} />;
          });
        }

        switch (file.type) {
          case 'FOLDER':
            handleOnFolderClick = (e) => { onFolderClick(file._id, file.name); };
            toggleButton = <Button onClick={(e) => { onToggleFolder(file._id); }} classNames={'btn'}>{toggleText}</Button>;
            break;
          case 'FILE':
            downloadButton = <Button onClick={(e) => { onDownloadFile(file._id, file.type); }} classNames={'btn'}>Download</Button>;
            break;
          default:
            break;
        }

        return (
          <div className={classNames}>
            <li>
              <div className="name">
                { toggleButton }            
                <div onClick={handleOnFolderClick}>{file.name}</div>
              </div>
              <div className="type">{file.type}</div>
              <div className="size">{file.size}</div>
              { downloadButton }
            </li>
            { subfilesList }
          </div>
        );
      }

      ReactDOM.render(<App />,
        document.getElementById('root')
      );