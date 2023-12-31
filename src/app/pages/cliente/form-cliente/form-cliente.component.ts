import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DateAdapter} from "@angular/material/core";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmationDialog} from "../../../core/confirmation-dialog/confirmation-dialog.component";
import {FuncionarioControllerService} from "../../../api/services/funcionario-controller.service";
import {FuncionarioDto} from "../../../api/models/funcionario-dto";
import {ClienteControllerService} from "../../../api/services/cliente-controller.service";
import {ClienteDto} from "../../../api/models/cliente-dto";
import {CategoriaDto} from "../../../api/models/categoria-dto";

@Component({
  selector: 'app-form-cliente',
  templateUrl: './form-cliente.component.html',
  styleUrls: ['./form-cliente.component.scss']
})
export class FormClienteComponent implements OnInit{
  formGroup!: FormGroup;
  public readonly ACAO_INCLUIR = "Cadastro";
  public readonly ACAO_EDITAR = "Editar";
  acao: string = this.ACAO_INCLUIR;
  codigo!: string;

  constructor(
    private formBuilder: FormBuilder,
    private _adapter: DateAdapter<any>,
    private clienteService: ClienteControllerService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this._adapter.setLocale('pt-br');
  }

  ngOnInit() {
    this.createForm();
    this._adapter.setLocale('pt-br');
    this.prepararEdicao();
  }



  private createForm() {
    if(this.acao == "Editar"){
      this.clienteService.clienteControllerObterPorId({id: this.codigo}).
      subscribe(retorno =>
          this.formGroup = this.formBuilder.group({
            nome: [retorno.nome, Validators.required],
            cpf: [retorno.cpf, Validators.required],
            nascimento: [retorno.nascimento, Validators.required],
            telefone: [retorno.telefone, Validators.required],
            email: [retorno.email, Validators.required]
          }));
    }else{
      this.formGroup = this.formBuilder.group({
        nome: [null, Validators.required],
        cpf: [null, Validators.required],
        nascimento: [null, Validators.required],
        telefone: [null, Validators.required],
        email: [null, Validators.required]
      })
    }
  }



  onSubmit() {
    console.log('Formulário submetido');
    if (this.formGroup.valid) {
      if(!this.codigo){
        this.realizarInclusao();
      }else{
        this.realizarEdicao();
      }
    }

  }

  private realizarInclusao(){
    const clienteDto: ClienteDto = {
      nome: this.formGroup.value.nome,
      cpf: this.formGroup.value.cpf,
      nascimento: this.formGroup.value.nascimento,
      telefone: this.formGroup.value.telefone,
      email: this.formGroup.value.email
    };
    console.log("Dados:",this.formGroup.value);
    this.clienteService.clienteControllerIncluir({body: clienteDto})
      .subscribe( retorno =>{
        console.log("Retorno:",retorno);
        this.confirmarInclusao(retorno);
        this.router.navigate(["/cliente"]);
      }, erro =>{
        console.log("Erro:"+erro);
        alert("Erro ao incluir!");
      })
  }


  confirmarInclusao(clienteDto: ClienteDto){
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        titulo: 'Mensagem!!!',
        mensagem: `Inclusão de: ${clienteDto.nome} (ID: ${clienteDto.cpf}) realiza com sucesso!`,
        textoBotoes: {
          ok: 'ok',
        },
      },
    });
  }


  limparFormulario() {
    this.formGroup.reset(); // limpa os campos do formulario.
  }


  private prepararEdicao() {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId){
      const codigo = paramId;
      console.log("codigo",paramId);
      this.clienteService.clienteControllerObterPorId({id: codigo}).subscribe(
        retorno => {
          this.acao = this.ACAO_EDITAR;
          console.log("retorno", retorno);
          this.codigo = retorno.cpf || "";
          this.formGroup.patchValue(retorno);
        },error => {
          console.log("erro", error);
        }
      )
    }
  }

  confirmarAcao(clienteDto: ClienteDto, acao: string) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        titulo: 'Mensagem!!!',
        mensagem: `Ação de ${acao} dados: ${clienteDto.nome} (ID: ${clienteDto.cpf}) realizada com sucesso!`,
        textoBotoes: {
          ok: 'ok',
        },
      },
    });
  }

  private realizarEdicao(){
    console.log("Dados:", this.formGroup.value);
    const cliente: ClienteDto = this.formGroup.value;
    this.clienteService.clienteControllerAlterar( {id: this.codigo, body: cliente})
      .subscribe(retorno => {
        console.log("Retorno:", retorno);
        this.confirmarAcao(retorno, this.ACAO_EDITAR);
        this.router.navigate(["/cliente"]);
      }, erro => {
        console.log("Erro:", erro.error);
        //this.showError(erro.error, this.ACAO_EDITAR);
      })
  }
}
