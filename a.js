const fs=require('fs')
const jspicl=require('jspicl')
const customMappers = {
  ThrowStatement: ({ argument }, { transpile }) =>
    `assert(false, ${transpile(argument)})`,
  ForInStatement: ({ left, right, body}, { transpile }) =>{
  if(left.type=="VariableDeclaration"){
  // left.declarations[0].init==null
  left.declarations[0].init=left.declarations[0].id
  return `for ${transpile(left.declarations[0].id)} in pairs(${transpile(right)}) do
${transpile(left)}
${transpile(body)}
end
`
    }else{
    // left.type=="Patterns"
    return `for ${transpile(left)} in pairs(${transpile(right)}) do ${transpile(body)} end`
    }
    },
    LabeledStatement: ({label, body},  { transpile }) =>
`repeat
::__LabeledStatement__${transpile(label)}__BEGIN__::
${transpile(body)}
::__LabeledStatement__${transpile(label)}__END__::
until true`,
BreakStatement: ({label},  { transpile }) =>
label==null?`break`:`goto __LabeledStatement__${transpile(label)}__END__`,
// [TODO] ContinueStatement
UpdateExpression:({operator, argument, prefix},  { transpile }) => // [TODO] as expression
operator=="++"?`${transpile(argument)}=${transpile(argument)}+1`:
operator=="--"?`${transpile(argument)}=${transpile(argument)}-1`:(()=>{throw "!"})()
}
const javascriptCode=fs.readFileSync('./lang.full.js','utf-8')
const { output } = jspicl(javascriptCode, { customMappers })
console.log(output)
