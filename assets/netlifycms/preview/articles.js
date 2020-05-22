class PostPreview extends React.Component {
  render() {
    const {entry, fieldsMetaData} = this.props;
    const authors = fieldsMetaData.getIn(['authors', 'persons']);

    return (
      <div className="p-4">
        <div className="pb-10">
          <h1 className="text-5xl font-normal">{ entry.getIn(['data', 'title']) }</h1>
          {authors &&
          <div>
            <div className="font-bold">Authors:</div>
            <ul>
              {authors.valueSeq().map( (author, index) => (
                <li key={index}>{author.get('title')} | @{author.get('twitter_handle')}</li>
              ))}
            </ul>
          </div>
          }
          <div className="my-4 user-content">
            {this.props.widgetFor('body')}
          </div>
        </div>
      </div>
    )
  }
}
CMS.registerPreviewTemplate("articles", PostPreview);