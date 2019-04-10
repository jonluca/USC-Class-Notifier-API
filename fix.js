const student = require('./server/models/student.js');

async function fix(){
	const students = await student.find();
	let d = new Date('3-15-2019')
	for(const s of students){
		let didModify = false;
		for(const sec of s.sectionsWatching){
			if(sec.date > d && s.semester != '20193'){
				s.semester = '20193';
				didModify = true;
			}
		}
		if(didModify){ await s.save(); console.log(`fixed ${s.email}`)}
	}
	console.log(students.length);
}

fix();

